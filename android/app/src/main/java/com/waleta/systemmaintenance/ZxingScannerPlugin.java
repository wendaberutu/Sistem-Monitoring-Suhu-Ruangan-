package com.waleta.systemmaintenance;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.journeyapps.barcodescanner.ScanOptions;

@CapacitorPlugin(name = "ZxingScanner")
public class ZxingScannerPlugin extends Plugin {

    public interface ScanCallback {
        void onResult(String contents);
    }

    @PluginMethod
    public void scan(PluginCall call) {
        saveCall(call);

        ScanOptions options = new ScanOptions();
        options.setDesiredBarcodeFormats(ScanOptions.QR_CODE);
        options.setPrompt("Arahkan kamera ke QR code");
        options.setBeepEnabled(false);
        options.setOrientationLocked(true);

        ((MainActivity) getActivity()).startScan(options, contents -> {
            PluginCall savedCall = getSavedCall();
            if (savedCall == null) return;

            if (contents != null && !contents.isEmpty()) {
                JSObject ret = new JSObject();
                ret.put("text", contents);
                savedCall.resolve(ret);
            } else {
                savedCall.reject("Scan dibatalkan");
            }
            freeSavedCall();
        });
    }
}
