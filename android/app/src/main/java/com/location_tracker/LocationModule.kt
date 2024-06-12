package com.location_tracker

import android.Manifest
import android.content.pm.PackageManager
import android.location.Location
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.*
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.tasks.OnSuccessListener
import android.util.Log

class LocationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private lateinit var fusedLocationClient: FusedLocationProviderClient

    init {
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(reactContext)
    }

    override fun getName(): String {
        return "LocationModule"
    }

    @ReactMethod
    fun getLocation(promise: Promise) {
        Log.d(TAG, "getLocation: hey")
        fusedLocationClient.lastLocation
            .addOnSuccessListener(OnSuccessListener<Location> { location: Location? ->
                if (location != null) {
                    val map = Arguments.createMap()
                    map.putDouble("latitude", location.latitude)
                    map.putDouble("longitude", location.longitude)
                    promise.resolve(map)
                } else {
                    promise.reject("LOCATION_ERROR", "Unable to get location")
                }
            })
    }
}