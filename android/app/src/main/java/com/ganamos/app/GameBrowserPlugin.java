package com.ganamos.app;

import android.content.Intent;
import android.net.Uri;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "GameBrowser")
public class GameBrowserPlugin extends Plugin {

    private boolean browserOpen = false;

    @PluginMethod
    public void open(PluginCall call) {
        String url = call.getString("url");
        String title = call.getString("title", "Juego");

        if (url == null || url.trim().isEmpty()) {
            call.reject("La dirección de la plataforma es obligatoria.");
            return;
        }

        Uri uri = Uri.parse(url.trim());
        if (!isAllowedUrl(uri)) {
            call.reject("Solo se permiten direcciones HTTPS válidas.");
            return;
        }

        if (browserOpen) {
            call.reject("Ya hay una plataforma abierta.");
            return;
        }

        browserOpen = true;

        Intent intent = new Intent(getContext(), GameBrowserActivity.class);
        intent.putExtra(GameBrowserActivity.EXTRA_URL, uri.toString());
        intent.putExtra(GameBrowserActivity.EXTRA_TITLE, title);
        startActivityForResult(call, intent, "onBrowserClosed");
    }

    @ActivityCallback
    private void onBrowserClosed(PluginCall call, ActivityResult result) {
        browserOpen = false;
        if (call == null) {
            return;
        }
        JSObject response = new JSObject();
        response.put("closed", true);
        call.resolve(response);
    }

    private boolean isAllowedUrl(Uri uri) {
        if (uri == null || uri.getScheme() == null || uri.getHost() == null) {
            return false;
        }
        if (!"https".equalsIgnoreCase(uri.getScheme())) {
            return false;
        }
        // Evita URLs con credenciales embebidas (https://usuario:clave@host).
        if (uri.getUserInfo() != null) {
            return false;
        }
        return uri.toString().length() <= 4096;
    }
}
