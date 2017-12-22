export function saveByteArrayAsFile(bytes, fileName) {
    let ba=new Uint8Array(bytes);
    let blob = new Blob([ba]);
    let link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
};