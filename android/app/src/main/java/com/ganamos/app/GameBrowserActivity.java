package com.ganamos.app;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.JsPromptResult;
import android.webkit.JsResult;
import android.webkit.PermissionRequest;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.SslErrorHandler;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Locale;

/**
 * Visor de plataformas dentro de la app. Usa un WebView real (no un iframe)
 * para poder cargar sitios que bloquean la incrustación por cabeceras CSP o
 * X-Frame-Options, manteniendo cookies, sesión y navegación internas.
 */
public class GameBrowserActivity extends AppCompatActivity {

    public static final String EXTRA_URL = "com.ganamos.app.extra.URL";
    public static final String EXTRA_TITLE = "com.ganamos.app.extra.TITLE";

    private static final String TAG = "GameBrowser";
    private static final long LOAD_TIMEOUT_MS = 30_000L;
    private static final int REQUEST_FILE_CHOOSER = 4101;

    private FrameLayout root;
    private View toolbar;
    private TextView titleView;
    private TextView subtitleView;
    private ProgressBar progressBar;
    private FrameLayout webContainer;
    private View loadingOverlay;
    private TextView loadingTitle;
    private TextView loadingDomain;
    private View errorOverlay;
    private TextView errorMessage;

    private WebView webView;
    private WebView failedView;
    private String failedUrl;
    private final Deque<WebView> popups = new ArrayDeque<>();

    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable timeoutRunnable;

    private String gameTitle = "Juego";
    private String gameUrl;
    private boolean firstMainLoad = true;
    private boolean hasError = false;

    private ValueCallback<Uri[]> filePathCallback;

    private View customView;
    private WebChromeClient.CustomViewCallback customViewCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        setContentView(R.layout.activity_game_browser);

        root = findViewById(R.id.gb_root);
        toolbar = findViewById(R.id.gb_toolbar);
        titleView = findViewById(R.id.gb_title);
        subtitleView = findViewById(R.id.gb_subtitle);
        progressBar = findViewById(R.id.gb_progress);
        webContainer = findViewById(R.id.gb_web_container);
        loadingOverlay = findViewById(R.id.gb_loading);
        loadingTitle = findViewById(R.id.gb_loading_title);
        loadingDomain = findViewById(R.id.gb_loading_domain);
        errorOverlay = findViewById(R.id.gb_error);
        errorMessage = findViewById(R.id.gb_error_message);

        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.setAppearanceLightStatusBars(false);
        controller.setAppearanceLightNavigationBars(false);

        ViewCompat.setOnApplyWindowInsetsListener(root, (view, insets) -> {
            Insets bars = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
            );
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return insets;
        });

        gameUrl = getIntent().getStringExtra(EXTRA_URL);
        String requestedTitle = getIntent().getStringExtra(EXTRA_TITLE);
        if (requestedTitle != null && !requestedTitle.trim().isEmpty()) {
            gameTitle = requestedTitle.trim();
        }

        Uri parsed = gameUrl == null ? null : Uri.parse(gameUrl);
        if (!isAllowedTopLevelUrl(parsed)) {
            Toast.makeText(this, "La plataforma no tiene una dirección segura.", Toast.LENGTH_LONG).show();
            finish();
            return;
        }

        titleView.setText(gameTitle);
        loadingTitle.setText("Cargando " + gameTitle + "...");
        loadingDomain.setText(parsed.getHost());

        findViewById(R.id.gb_back).setOnClickListener(v -> handleBack());
        findViewById(R.id.gb_reload).setOnClickListener(v -> reloadPlatform());
        findViewById(R.id.gb_close).setOnClickListener(v -> finish());
        findViewById(R.id.gb_retry).setOnClickListener(v -> retryLoad());
        findViewById(R.id.gb_error_close).setOnClickListener(v -> finish());

        if ((getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        setupWebView();
        showLoading();
        webView.loadUrl(gameUrl);

        // En Android moderno el back debe pasar por el dispatcher para que
        // podamos cerrar un popup o retroceder en el historial del sitio.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                handleBack();
            }
        });
    }

    private void setupWebView() {
        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#06010D"));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        configureSettings(webView);
        webView.setWebViewClient(createWebViewClient());
        webView.setWebChromeClient(createChromeClient());
        webContainer.addView(
            webView,
            0,
            new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        );
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureSettings(WebView target) {
        WebSettings settings = target.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setSupportMultipleWindows(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setGeolocationEnabled(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        cookies.setAcceptThirdPartyCookies(target, true);
    }

    private WebViewClient createWebViewClient() {
        return new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !isAllowedTopLevelUrl(request.getUrl());
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                if (!isAllowedTopLevelUrl(url == null ? null : Uri.parse(url))) {
                    view.stopLoading();
                    showError(view, url, "La plataforma intentó abrir una dirección no segura.");
                    return;
                }

                if (view == webView) {
                    hasError = false;
                    hideError();
                    updateSubtitle(url);
                    if (firstMainLoad) {
                        showLoading();
                    }
                    startLoadTimeout();
                }

                progressBar.setVisibility(View.VISIBLE);
                if (progressBar.getProgress() < 5) {
                    progressBar.setProgress(5);
                }
            }

            @Override
            public void onPageCommitVisible(WebView view, String url) {
                if (view == webView && !hasError) {
                    hideLoading();
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                if (view == webView) {
                    firstMainLoad = false;
                    cancelLoadTimeout();
                    progressBar.setVisibility(View.GONE);
                    if (!hasError) {
                        hideLoading();
                    }
                    updateSubtitle(url);
                    Log.i(TAG, "loaded " + sanitizeUrlForLog(url));
                }
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (!request.isForMainFrame()) {
                    return;
                }

                String description = error.getDescription() == null
                    ? "Error de red"
                    : error.getDescription().toString();
                String url = request.getUrl() == null ? view.getUrl() : request.getUrl().toString();

                if (view == webView) {
                    showError(view, url, description);
                    Log.e(TAG, "load_error " + error.getErrorCode() + " " + sanitizeUrlForLog(url));
                } else {
                    closePopup(view);
                    Toast.makeText(
                        GameBrowserActivity.this,
                        "No se pudo abrir la ventana emergente.",
                        Toast.LENGTH_LONG
                    ).show();
                    Log.e(TAG, "popup_error " + error.getErrorCode() + " " + sanitizeUrlForLog(url));
                }
            }

            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                // Nunca se continúa con un certificado inválido.
                handler.cancel();
                if (view == webView) {
                    showError(
                        view,
                        view.getUrl(),
                        "No se pudo establecer una conexión segura con la plataforma."
                    );
                } else {
                    closePopup(view);
                    Toast.makeText(
                        GameBrowserActivity.this,
                        "La ventana emergente no tiene una conexión segura.",
                        Toast.LENGTH_LONG
                    ).show();
                }
                Log.e(TAG, "ssl_error " + error.getPrimaryError());
            }

            @Override
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                Log.e(TAG, "render_process_gone crashed=" + detail.didCrash());
                if (view == webView) {
                    String url = view.getUrl() == null ? gameUrl : view.getUrl();
                    webContainer.removeView(view);
                    view.destroy();
                    webView = null;
                    setupWebView();
                    showError(
                        webView,
                        url,
                        "El contenido de la plataforma se cerró inesperadamente."
                    );
                } else {
                    closePopup(view);
                }
                return true;
            }
        };
    }

    private WebChromeClient createChromeClient() {
        return new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                progressBar.setVisibility(newProgress >= 100 ? View.GONE : View.VISIBLE);
            }

            @Override
            public void onReceivedTitle(WebView view, String title) {
                if (view == webView && !hasError && title != null && !title.trim().isEmpty()
                    && !"about:blank".equals(title)) {
                    titleView.setText(title.trim());
                }
            }

            @Override
            public boolean onCreateWindow(
                WebView view,
                boolean isDialog,
                boolean isUserGesture,
                Message resultMsg
            ) {
                if (!(resultMsg.obj instanceof WebView.WebViewTransport)) {
                    return false;
                }

                WebView popup = new WebView(GameBrowserActivity.this);
                popup.setBackgroundColor(Color.parseColor("#06010D"));
                configureSettings(popup);
                popup.setWebViewClient(createWebViewClient());
                popup.setWebChromeClient(createChromeClient());

                int index = Math.max(0, webContainer.indexOfChild(webView) + 1);
                webContainer.addView(
                    popup,
                    index,
                    new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                );
                popups.push(popup);
                updateSubtitle(view.getUrl());

                WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(popup);
                resultMsg.sendToTarget();
                Log.i(TAG, "popup_opened");
                return true;
            }

            @Override
            public void onCloseWindow(WebView window) {
                closePopup(window);
            }

            @Override
            public void onShowCustomView(View view, CustomViewCallback callback) {
                if (customView != null) {
                    callback.onCustomViewHidden();
                    return;
                }

                customView = view;
                customViewCallback = callback;
                root.addView(
                    view,
                    new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                );
                toolbar.setVisibility(View.GONE);
                progressBar.setVisibility(View.GONE);
                root.setPadding(0, 0, 0, 0);

                WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(
                    getWindow(),
                    getWindow().getDecorView()
                );
                controller.hide(WindowInsetsCompat.Type.systemBars());
                controller.setSystemBarsBehavior(
                    WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                );
            }

            @Override
            public void onHideCustomView() {
                exitFullscreen();
            }

            @Override
            public void onPermissionRequest(PermissionRequest request) {
                // No se conceden cámara, micrófono ni otros recursos sensibles.
                request.deny();
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(
                String origin,
                GeolocationPermissions.Callback callback
            ) {
                callback.invoke(origin, false, false);
            }

            @Override
            public boolean onShowFileChooser(
                WebView view,
                ValueCallback<Uri[]> callback,
                FileChooserParams params
            ) {
                if (filePathCallback != null) {
                    filePathCallback.onReceiveValue(null);
                }
                filePathCallback = callback;

                try {
                    startActivityForResult(params.createIntent(), REQUEST_FILE_CHOOSER);
                    return true;
                } catch (ActivityNotFoundException e) {
                    filePathCallback = null;
                    Toast.makeText(
                        GameBrowserActivity.this,
                        "No hay una aplicación disponible para elegir archivos.",
                        Toast.LENGTH_LONG
                    ).show();
                    return false;
                }
            }

            @Override
            public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
                new AlertDialog.Builder(GameBrowserActivity.this, R.style.GameBrowserDialog)
                    .setTitle(view.getTitle())
                    .setMessage(message)
                    .setPositiveButton("Aceptar", (dialog, which) -> result.confirm())
                    .setCancelable(false)
                    .show();
                return true;
            }

            @Override
            public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
                new AlertDialog.Builder(GameBrowserActivity.this, R.style.GameBrowserDialog)
                    .setTitle(view.getTitle())
                    .setMessage(message)
                    .setPositiveButton("Aceptar", (dialog, which) -> result.confirm())
                    .setNegativeButton("Cancelar", (dialog, which) -> result.cancel())
                    .setOnCancelListener(dialog -> result.cancel())
                    .show();
                return true;
            }

            @Override
            public boolean onJsPrompt(
                WebView view,
                String url,
                String message,
                String defaultValue,
                JsPromptResult result
            ) {
                EditText input = new EditText(GameBrowserActivity.this);
                input.setText(defaultValue == null ? "" : defaultValue);
                input.setSelection(input.getText().length());

                new AlertDialog.Builder(GameBrowserActivity.this, R.style.GameBrowserDialog)
                    .setTitle(view.getTitle())
                    .setMessage(message)
                    .setView(input)
                    .setPositiveButton(
                        "Aceptar",
                        (dialog, which) -> result.confirm(input.getText().toString())
                    )
                    .setNegativeButton("Cancelar", (dialog, which) -> result.cancel())
                    .setOnCancelListener(dialog -> result.cancel())
                    .show();
                return true;
            }
        };
    }

    private boolean isAllowedTopLevelUrl(Uri uri) {
        if (uri == null || uri.getScheme() == null) {
            return false;
        }

        String scheme = uri.getScheme().toLowerCase(Locale.ROOT);
        if ("https".equals(scheme)) {
            return uri.getHost() != null && uri.getUserInfo() == null;
        }
        if ("about".equals(scheme) && "blank".equals(uri.getSchemeSpecificPart())) {
            return true;
        }

        if ("http".equals(scheme)) {
            Toast.makeText(
                this,
                "La plataforma intentó abrir una conexión no segura.",
                Toast.LENGTH_LONG
            ).show();
        } else {
            Toast.makeText(
                this,
                "Ese enlace no se puede abrir dentro de la app.",
                Toast.LENGTH_LONG
            ).show();
        }
        Log.w(TAG, "blocked_scheme " + scheme);
        return false;
    }

    private void showLoading() {
        loadingOverlay.setVisibility(View.VISIBLE);
        errorOverlay.setVisibility(View.GONE);
    }

    private void hideLoading() {
        loadingOverlay.setVisibility(View.GONE);
    }

    private void showError(WebView view, String url, String detail) {
        hasError = true;
        failedView = view;
        failedUrl = url;
        cancelLoadTimeout();
        progressBar.setVisibility(View.GONE);
        hideLoading();
        errorMessage.setText(buildErrorMessage(detail, url));
        errorOverlay.setVisibility(View.VISIBLE);
        errorOverlay.bringToFront();
    }

    private void hideError() {
        hasError = false;
        errorOverlay.setVisibility(View.GONE);
    }

    private String buildErrorMessage(String detail, String url) {
        String raw = detail == null ? "" : detail;
        String lower = raw.toLowerCase(Locale.ROOT);
        String message;

        if (lower.contains("err_internet_disconnected") || lower.contains("err_network_changed")) {
            message = "No hay conexión a internet. Verificá tu red e intentá de nuevo.";
        } else if (lower.contains("err_name_not_resolved")) {
            message = "No se pudo encontrar el servidor de la plataforma. Verificá tu conexión.";
        } else if (lower.contains("err_connection")) {
            message = "No se pudo conectar con la plataforma. Intentá de nuevo en unos segundos.";
        } else if (lower.contains("err_timed_out")) {
            message = "La plataforma tardó demasiado en responder. Intentá de nuevo.";
        } else if (lower.contains("err_ssl") || lower.contains("cert")) {
            message = "La conexión segura con la plataforma no es válida.";
        } else if (lower.contains("no seguro") || lower.contains("segura")) {
            message = raw;
        } else {
            message = "No se pudo cargar la plataforma. Intentá de nuevo.";
            if (!raw.isEmpty()) {
                message += "\n\n" + raw;
            }
        }

        String host = safeHost(url);
        if (!host.isEmpty()) {
            message += "\n\n" + host;
        }
        return message;
    }

    private void retryLoad() {
        hideError();
        showLoading();
        progressBar.setVisibility(View.VISIBLE);
        progressBar.setProgress(0);

        WebView target = failedView != null ? failedView : webView;
        if (target == null) {
            return;
        }

        if (failedUrl != null && !failedUrl.isEmpty()) {
            target.loadUrl(failedUrl);
        } else {
            target.reload();
        }
    }

    private void reloadPlatform() {
        if (webView == null) {
            return;
        }
        hideError();
        progressBar.setVisibility(View.VISIBLE);
        progressBar.setProgress(0);
        webView.reload();
    }

    private void handleBack() {
        boolean canGoBack = webView != null && webView.canGoBack();
        Log.i(TAG, "back popups=" + popups.size() + " canGoBack=" + canGoBack);

        if (customView != null) {
            exitFullscreen();
            return;
        }
        if (!popups.isEmpty()) {
            closeTopPopup();
            return;
        }
        if (canGoBack) {
            webView.goBack();
            return;
        }
        finish();
    }

    private void closePopup(WebView popup) {
        if (popup == null) {
            return;
        }
        popups.remove(popup);
        webContainer.removeView(popup);
        try {
            popup.stopLoading();
            popup.destroy();
        } catch (Exception ignored) {
            // El WebView ya estaba destruido.
        }
        updateSubtitle(webView == null ? gameUrl : webView.getUrl());
        Log.i(TAG, "popup_closed");
    }

    private void closeTopPopup() {
        WebView popup = popups.peek();
        if (popup != null) {
            closePopup(popup);
        }
    }

    private void updateSubtitle(String url) {
        if (!popups.isEmpty()) {
            subtitleView.setText("Ventana emergente · usá ← para volver");
            return;
        }
        String host = safeHost(url == null || url.isEmpty() ? gameUrl : url);
        subtitleView.setText(host);
    }

    /** Evita registrar query strings o fragmentos con posibles tokens de sesión. */
    private String sanitizeUrlForLog(String url) {
        if (url == null) {
            return "null";
        }
        try {
            Uri uri = Uri.parse(url);
            String host = uri.getHost();
            if (host == null) {
                return uri.getScheme() == null ? "invalid" : uri.getScheme();
            }
            return uri.getScheme() + "://" + host + (uri.getPath() == null ? "" : uri.getPath());
        } catch (Exception e) {
            return "invalid";
        }
    }

    private String safeHost(String url) {
        if (url == null) {
            return "";
        }
        try {
            String host = Uri.parse(url).getHost();
            return host == null ? "" : host;
        } catch (Exception e) {
            return "";
        }
    }

    private void startLoadTimeout() {
        cancelLoadTimeout();
        timeoutRunnable = () -> {
            if (webView == null) {
                return;
            }
            webView.stopLoading();
            showError(
                webView,
                webView.getUrl() == null ? gameUrl : webView.getUrl(),
                "La plataforma tardó demasiado en responder."
            );
            Log.e(TAG, "load_timeout");
        };
        handler.postDelayed(timeoutRunnable, LOAD_TIMEOUT_MS);
    }

    private void cancelLoadTimeout() {
        if (timeoutRunnable != null) {
            handler.removeCallbacks(timeoutRunnable);
            timeoutRunnable = null;
        }
    }

    private void enterFullscreenExitIfNeeded() {
        if (customView != null) {
            exitFullscreen();
        }
    }

    private void exitFullscreen() {
        if (customView == null) {
            return;
        }

        root.removeView(customView);
        customView = null;
        toolbar.setVisibility(View.VISIBLE);

        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(
            getWindow(),
            getWindow().getDecorView()
        );
        controller.show(WindowInsetsCompat.Type.systemBars());
        ViewCompat.requestApplyInsets(root);

        if (customViewCallback != null) {
            customViewCallback.onCustomViewHidden();
            customViewCallback = null;
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
        for (WebView popup : popups) {
            popup.onResume();
        }
    }

    @Override
    protected void onPause() {
        if (webView != null) {
            webView.onPause();
        }
        for (WebView popup : popups) {
            popup.onPause();
        }
        super.onPause();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQUEST_FILE_CHOOSER) {
            if (filePathCallback != null) {
                filePathCallback.onReceiveValue(
                    WebChromeClient.FileChooserParams.parseResult(resultCode, data)
                );
                filePathCallback = null;
            }
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onDestroy() {
        cancelLoadTimeout();
        enterFullscreenExitIfNeeded();

        if (filePathCallback != null) {
            filePathCallback.onReceiveValue(null);
            filePathCallback = null;
        }

        for (WebView popup : popups) {
            webContainer.removeView(popup);
            popup.destroy();
        }
        popups.clear();

        if (webView != null) {
            webContainer.removeView(webView);
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }

        super.onDestroy();
    }
}
