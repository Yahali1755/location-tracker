package com.location_tracker

import android.content.Context
import android.app.KeyguardManager
import com.facebook.react.bridge.*

class LockDetector(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val keyguardManager: KeyguardManager = reactContext.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager

    override fun getName(): String {
        return "LockDetector"
    }

    @ReactMethod
    fun isDeviceLocked(promise: Promise) {
        try {
            val isLocked = keyguardManager.isKeyguardLocked

            promise.resolve(isLocked)
        } catch (error: Exception) {
            promise.reject("KeyguardManagerError", error)
        }
    }
}