package com.lifetrackapp

import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "LifeTrackApp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
   * ✅ Enable edge-to-edge display and transparent navigation bar
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
    
    // Enable edge-to-edge mode for Android 11+ (API 30+)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      window.setDecorFitsSystemWindows(false)
    }
    
    // Set transparent navigation bar for Android 8+ (API 26+)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      window.navigationBarColor = android.graphics.Color.TRANSPARENT
      
      // Make navigation bar icons dark on light backgrounds
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        var flags = window.decorView.systemUiVisibility
        flags = flags or View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
        window.decorView.systemUiVisibility = flags
      }
    }
    
    // Allow drawing behind system bars
    window.setFlags(
      WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
      WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
    )
  }
}