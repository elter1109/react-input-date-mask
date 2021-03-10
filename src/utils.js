const ua = window.navigator?.userAgent ?? "";

function searchMobil(ua) {
    const regex = /Mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|mini/i
    return regex.test(ua)
}
export const ie = (ua.indexOf("MSIE ") !== -1) || (ua.indexOf("Trident/") !== -1);
export const mobile = window.hasOwnProperty('ontouchstart') && searchMobil(ua)
export const ieMobile = /iemobile/i.test(ua);
export const iphone = /iphone/i.test(ua) && !ieMobile;
