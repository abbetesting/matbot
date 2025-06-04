(() => {
  if (!window.__cnmjsInvoked) {
    try {
      var cnmSettings = JSON.parse('{"signal":"1:5f9562c1-be9c-4898-bc6a-5b40de4e1450:6840612d0e967100081ca097:1749049741273","cnmSettingsLocation":"/netlify-cnm/cnm-settings.json","cnmMainClientLocation":"https://client-network-manager.netlify.app/cnm-main-client.js","cnmSWLocation":"/cnm-sw.js","cnmSnippetScriptLocation":"/netlify-cnm/cnm.js","clientCaching":"static-only","cachingOptions":{"navResourceAffinity":"enabled","precachingLookahead":"enabled","precachingCacheUpgrades":"enabled","precachingConfiguredRoutes":["/DeployLogGame.bundle.js","/DropPage.bundle.js","/FunctionLogsPage.bundle.js","/FunctionsPage.bundle.js","/StartPage.bundle.js","/TeamCreatePage.bundle.js","/TeamUpdatePage.bundle.js","/UserPage.bundle.js"]},"deltaEncoding":"disabled","versionControls":{"consistencyVersion":null,"consistencyEnforcement":"enforce"}}');
      window.netlify = window.netlify || {};
      window.netlify.cnm = window.netlify.cnm || {};
      window.netlify.cnm.settings = cnmSettings;
      var cnmScript = document.createElement('script');
      cnmScript.src = cnmSettings.cnmMainClientLocation;
      cnmScript.async = true;
      document.body.appendChild(cnmScript);
    } catch (e) {
      console.error(e);
    }
  }
})();
