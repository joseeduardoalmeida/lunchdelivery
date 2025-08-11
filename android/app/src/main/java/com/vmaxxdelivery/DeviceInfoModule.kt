package com.vmaxxdelivery;

import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class DeviceInfoModule(reactContext: ReactApplicationContext): ReactContextBaseJavaModule(reactContext){
    override fun getName(): String {
        return "DeviceInfoModule"
    }

    @ReactMethod
    fun getManufacturer(promise: Promise){
        try {
            val manufacturer = Build.MANUFACTURER
            promise.resolve(manufacturer)
        } catch (e: Exception){
            promise.reject("ERROR", "Erro ao obter informações do fabricante", e)
        }
    }
}