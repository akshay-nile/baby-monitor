export let browserID = localStorage.getItem('baby-monitor-browser-id');

if (!browserID) {
    browserID = URL.createObjectURL(new Blob()).split('/').pop()?.split('-').pop() as string;
    localStorage.setItem('baby-monitor-browser-id', browserID);
}