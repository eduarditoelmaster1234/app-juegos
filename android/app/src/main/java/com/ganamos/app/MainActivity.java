package com.ganamos.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(GameBrowserPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
