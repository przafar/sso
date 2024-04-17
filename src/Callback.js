import { useState, useEffect } from "react";

function CallBack() {



  const getToken = (url, params, success, error) => {
    console.log("getToken", url, params, success, error);
    var request = new XMLHttpRequest();
    request.open("POST", url, true);
    request.setRequestHeader(
      "Content-Type",
      "application/x-www-form-urlencoded; charset=UTF-8"
    );
    request.onload = function () {
      var body = {};
      try {
        body = JSON.parse(request.response);
      } catch (e) {}
      if (request.status === 200) {
        success(request, body);
      } else {
        error(request, body);
      }
    };
    request.onerror = function () {
      error(request, {});
    };
    var body = Object.keys(params)
      .map((key) => key + "=" + params[key])
      .join("&");
    request.send(body);
  };

  const parseQueryString = (string) => {
    if (string === "") {
      return {};
    }
    var segments = string.split("&").map((s) => s.split("="));
    var queryString = {};
    segments.forEach((s) => (queryString[s[0]] = s[1]));
    return queryString;
  };

  useEffect(() => {

    const q = parseQueryString(window.location.search.substring(1));
    console.log(q);

    if (q.error) {
      alert("Error returned from authorization server: " + q.error);
      document.getElementById("error_details").innerText =
        q.error + "\n\n" + q.error_description;
      document.getElementById("error").classList = "";
    }

    if (q.code) {
      console.log("q.state", q.state);
      if (true) {
        getToken(
          'https://test-sso.ssv.uz/oauth/token',
          {
            grant_type: "authorization_code",
            code: q.code,
            client_id: "97c3e637-6441-4cbe-95fa-5cbf6fb907a3",
            redirect_uri: "http://localhost:3000/auth/callback",
            code_verifier: localStorage.getItem("pkce_code_verifier"),
            claims: "organization",
          },
          function (request, body) {
            document.getElementById("error_details").innerText = JSON.stringify(body);
          },
          function (request, error) {
            document.getElementById("error_details").innerText =
              error.error + "\n\n" + error.error_description;
            document.getElementById("error").classList = "";
          }
        );
      } 

    
    }
  }, );

  return (
    <div>
      <div id="error">Callback</div>
      <div id="error_details"></div>
    </div>
  );
}

export default CallBack;
