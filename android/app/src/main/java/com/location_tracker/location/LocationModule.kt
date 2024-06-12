package com.location_tracker

import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.Manifest
import android.content.pm.PackageManager
import android.location.Location
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.*
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices

class LocationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var fusedLocationClient: FusedLocationProviderClient

    init {
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(reactContext)
    }

    override fun getName(): String {
        return "LocationModule"
    }

    @ReactMethod
    fun getLocation(promise: Promise) {
        fusedLocationClient.lastLocation
                .addOnSuccessListener { location: Location? ->
                    if (location != null) {
                        val map = Arguments.createMap()

                        map.putDouble("latitude", location.latitude)
                        map.putDouble("longitude", location.longitude)

                        promise.resolve(map)
                    } else {
                        promise.reject("LOCATION_ERROR", "Unable to get location")
                    }
                }
    }
}