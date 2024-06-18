package com.location_tracker

import android.location.Location
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
                        promise.reject("LOCATION_ERROR", "Unable to get the location")
                    }
                }
    }
}