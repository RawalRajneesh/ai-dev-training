import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
#if DEBUG
    // RCTBundleURLProvider reads NSUserDefaults "RCT_jsLocation". Empty or ":port" values become
    // URLs with no hostname (e.g. http://:8081/), which makes HMRClient.setup throw
    // "Missing required parameter `host`".
    clearInvalidPackagerJsLocationIfNeeded()
#endif
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "StreamList",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

#if DEBUG
  /// `RCT_jsLocation` must be `host`, `host:port`, or unset — never empty or leading `:` only.
  private func clearInvalidPackagerJsLocationIfNeeded() {
    let key = "RCT_jsLocation"
    guard let raw = UserDefaults.standard.string(forKey: key) else { return }
    let trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
    if trimmed.isEmpty || trimmed.hasPrefix(":") {
      UserDefaults.standard.removeObject(forKey: key)
    }
  }
#endif
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
