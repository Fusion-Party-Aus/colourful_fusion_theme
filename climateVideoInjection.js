document.addEventListener('DOMContentLoaded', function() {
    var videoContainer = document.getElementById('climate-container');
    if (videoContainer) {
      var videoSrc = 'https://fusionparty.space/video/climate_stripe_video_trimmed.webm';
      var videoHtml = `
        <video width="100%" autoplay="" loop="" muted="" playsinline="" class="rounded">
          <source src="${videoSrc}" type="video/webm">
          Your browser must not support the video tag.
        </video>
      `;
      videoContainer.innerHTML = videoHtml;
    }
});
