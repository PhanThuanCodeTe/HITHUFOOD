import { GEOCODING_APIKEY } from "@env";

const formatAddressToXY = async (address) => {
  const formattedAddress = formatAddress(address);
  const apiUrl = `https://geocode.maps.co/search?q=${formattedAddress}&api_key=${GEOCODING_APIKEY}`;
  try {
    const response = await fetch(apiUrl);
    const text = await response.text();
    const data = JSON.parse(text);
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return { x: lat.toString(), y: lon.toString() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching geocode data:", error);
    return null;
  }
};

const formatAddress = (address) => {
  let formattedAddress = address
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/,/g, "")
    .replace(/\s+/g, "-")
    .replace(/\bPhường\b|\bphuong\b/gi, "Ward")
    .replace(/\bQuận\b|\bquan\b/gi, "District");
  return formattedAddress + "+ho+chi+minh+city";
};

export { formatAddressToXY };