(function () {
  var params = new URLSearchParams(window.location.search);
  var campaignId = params.get("campaign_id") || "";
  var leadId = params.get("lead_id") || "";
  if (!campaignId || !leadId) return;

  var scriptEl = document.currentScript;
  var apiBase =
    (typeof window.CARTEDO_TRACK_API === "string" && window.CARTEDO_TRACK_API) ||
    (scriptEl && scriptEl.getAttribute("data-track-api")) ||
    "";
  if (!apiBase) {
    console.warn("[Cartedo] Set window.CARTEDO_TRACK_API in cartedo-track-config.js");
    return;
  }
  apiBase = apiBase.replace(/\/$/, "");

  function ping(path, extra) {
    var qs =
      "campaign_id=" +
      encodeURIComponent(campaignId) +
      "&lead_id=" +
      encodeURIComponent(leadId) +
      (extra || "");
    fetch(apiBase + path + "?" + qs, { credentials: "omit", mode: "cors" }).catch(
      function () {}
    );
  }

  ping("/track/open");

  function isHotClick(text) {
    var t = (text || "").toLowerCase().replace(/\s+/g, " ").trim();
    return t.indexOf("generate") !== -1 && t.indexOf("preview") !== -1;
  }

  document.addEventListener(
    "click",
    function (e) {
      var t = e.target;
      for (var i = 0; i < 8; i++) {
        if (!t || t === document) break;
        var tag = (t.tagName || "").toUpperCase();
        var role = t.getAttribute ? t.getAttribute("role") : "";
        if (tag === "BUTTON" || tag === "A" || role === "button") {
          var action = (t.innerText || t.textContent || "").trim().slice(0, 120) || "click";
          if (isHotClick(action)) {
            ping("/track/click", "&action=" + encodeURIComponent(action));
          }
          break;
        }
        t = t.parentElement;
      }
    },
    true
  );
})();
