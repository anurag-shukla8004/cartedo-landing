(function () {
  var params = new URLSearchParams(window.location.search);
  var campaignId = params.get("campaign_id") || "";
  var leadId = params.get("lead_id") || "";
  if (!campaignId || !leadId) {
    console.warn(
      "[Cartedo] Missing campaign_id or lead_id in URL — events will not be tracked"
    );
    return;
  }

  var scriptEl = document.currentScript;
  var apiBase =
    (typeof window.CARTEDO_TRACK_API === "string" && window.CARTEDO_TRACK_API) ||
    (scriptEl && scriptEl.getAttribute("data-track-api")) ||
    "";
  if (!apiBase) {
    console.warn(
      "[Cartedo] Set window.CARTEDO_TRACK_API in cartedo-track-config.js"
    );
    return;
  }
  apiBase = apiBase.replace(/\/$/, "");

  function ping(path, extraQuery, body) {
    var qs =
      "campaign_id=" +
      encodeURIComponent(campaignId) +
      "&lead_id=" +
      encodeURIComponent(leadId) +
      (extraQuery || "");

    if (body) {
      fetch(apiBase + path + "?" + qs, {
        body: JSON.stringify(body),
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        method: "POST",
        mode: "cors",
      }).catch(function () {});
      return;
    }

    fetch(apiBase + path + "?" + qs, {
      credentials: "omit",
      mode: "cors",
    }).catch(function () {});
  }

  // Landing page open → Warm (opened)
  ping("/track/open");

  function isHotClick(text) {
    var t = (text || "").toLowerCase().replace(/\s+/g, " ").trim();
    return (
      (t.indexOf("generate") !== -1 && t.indexOf("preview") !== -1) ||
      t.indexOf("build my simulation") !== -1 ||
      t.indexOf("preview sample") !== -1
    );
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
          var action =
            (t.innerText || t.textContent || "").trim().slice(0, 120) || "click";
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

  // Form submit → Hot (form_submitted)
  document.addEventListener(
    "submit",
    function (e) {
      var form = e.target;
      if (!form || (form.tagName || "").toUpperCase() !== "FORM") return;

      var fields = {};
      try {
        var data = new FormData(form);
        data.forEach(function (value, key) {
          if (typeof value === "string") {
            fields[String(key).slice(0, 80)] = value.slice(0, 500);
          }
        });
      } catch (_) {}

      var action =
        (form.getAttribute("name") ||
          form.getAttribute("id") ||
          form.getAttribute("aria-label") ||
          "form_submit"
        ).slice(0, 120);

      ping("/track/form", "", {
        action: action,
        campaign_id: campaignId,
        fields: fields,
        lead_id: leadId,
      });
    },
    true
  );
})();
