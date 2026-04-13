package com.waleta.systemmaintenance;

import android.os.Bundle;

import androidx.activity.result.ActivityResultLauncher;

import com.getcapacitor.BridgeActivity;
import com.journeyapps.barcodescanner.ScanContract;
import com.journeyapps.barcodescanner.ScanIntentResult;
import com.journeyapps.barcodescanner.ScanOptions;

public class MainActivity extends BridgeActivity {

    private ActivityResultLauncher<ScanOptions> scanLauncher;
    ZxingScannerPlugin.ScanCallback pendingScanCallback;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ZxingScannerPlugin.class);
        super.onCreate(savedInstanceState);

        scanLauncher = registerForActivityResult(new ScanContract(), result -> {
            if (pendingScanCallback != null) {
                pendingScanCallback.onResult(result.getContents());
                pendingScanCallback = null;
            }
        });
    }

    public void startScan(ScanOptions options, ZxingScannerPlugin.ScanCallback callback) {
        pendingScanCallback = callback;
        scanLauncher.launch(options);
    }
}
