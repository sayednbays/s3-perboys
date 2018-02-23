export function saveByteArrayAsFile(bytes, fileName) {
    let ba=new Uint8Array(bytes);
    let blob = new Blob([ba]);
    let link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
};
export function downloadFile(uri, name) {
    let link = document.createElement("a");
    if(name)
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }