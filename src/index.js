import React from "react";
import ReactDOM from "react-dom";
import { CSDialer } from "csdialler";

const CSDialerSDK = {
  init: (options) => {
    const {
      apiKey,
      user_id,
      env,
      authAPI,
      wssServerEnv,
      isCallingEnabled,
      open,
      mode,
    } = options;

    if (!document.getElementById("cleverstack-dialer")) {
      const dialerElement = document.createElement("div");
      dialerElement.setAttribute("id", "cleverstack-dialer");
      document.body.appendChild(dialerElement);
      ReactDOM.createRoot(document.getElementById("cleverstack-dialer")).render(
        <CSDialer
          apiKey={apiKey}
          user_id={user_id}
          env={env}
          authAPI={authAPI}
          showFloatingIcon={true}
          open={open}
          wssServerEnv={wssServerEnv}
          isCallingEnabled={isCallingEnabled}
          mode={mode}
        />
      );
    }
  },
};

// export default CSDialerSDK;
export { CSDialerSDK };
