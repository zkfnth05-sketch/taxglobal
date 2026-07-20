const url = "https://jjdykydkgtosiymxjpmh.supabase.co/rest/v1/";
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZHlreWRrZ3Rvc2l5bXhqcG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkyNjIzODQsImV4cCI6MjAxNDgzODM4NH0.gV2jrgbe8ptcdJ0WoD10l1ycFUgHj9nKrx_tNCJzbjU";

async function explore() {
  try {
    const res = await fetch(url, {
      headers: {
        "apikey": apikey,
        "Authorization": `Bearer ${apikey}`,
        "Accept": "application/openapi+json"
      }
    });
    const text = await res.text();
    console.log("Response Status:", res.status);
    console.log("Response Body:", text.substring(0, 1000));
  } catch (err) {
    console.error("Error exploring:", err);
  }
}

explore();
