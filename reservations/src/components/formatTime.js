function formatTime(h) {
    let time = parseInt(h);
    const fTime = time > 12 ? String(time - 12) + " pm" : String(time) + " am";
    return fTime; 
}

export default formatTime;