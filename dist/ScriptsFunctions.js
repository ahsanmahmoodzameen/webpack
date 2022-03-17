//import { jsPDF } from "jspdf";
/*
function view360Photo() {
  console.log("button clicked for 360 photo");
  //window.open("https://hassaamsufi6.shapespark.com/miilanapartment01/");
  document.getElementById("panorama-360-view").hidden = "";
  document.getElementById("crossButton").hidden = "";
  pannellum.viewer("panorama-360-view", {
    type: "equirectangular",

    panorama: "./images/360/1-min.JPG",

    autoLoad: true,
  });
}


function viewTours(shapesparkLink) {
 window.open(shapesparkLink);
 //window.open("https://hassaamsufi6.shapespark.com/miilanapartment01/");
}

function viewTVC() {
  //document.getElementById("tvcVideo").hidden = "";
//  var video=document.getElementById("Video-section");
 // video.pause();
  //        video.currentTime = 0;
  
document.getElementById("Video-section").hidden = "";

  $(".youtube-popup > div").click(function () {
    window.open($(this).parent().children("iframe").attr("src"));
  });
}
*/

/*
function savePaymentPlan() {
 console.log("save is called");
 const doc = new jsPDF();

            doc.text(10, 10, "Apartment");
            doc.text(50, 10, featureName);
            var dataForPDF;
            dataForPDF = pickedFeature.getProperty("PropForceID");
            doc.text(50, 20, dataForPDF);
            doc.text(10, 20, "PropForceId");
            dataForPDF = users.data[i].unitNumber;
            doc.text(10, 30, "unit Number");
            doc.text(50, 30, dataForPDF);
            var splitTitle = doc.splitTextToSize(users.data[i].landArea, 180);
            // dataForPDF = users.data[i].landArea;
            doc.text(10, 40, "Land Area");
            doc.text(50, 40, splitTitle);
            splitTitle = doc.splitTextToSize(users.data[i].bed, 180);
            doc.text(50, 50, splitTitle);
            doc.text(10, 50, "Bed Room");
            splitTitle = doc.splitTextToSize(
              users.data[i].ListingStatus.name,
              180
            );
            doc.text(10, 60, "Status");
            doc.text(50, 60, splitTitle);
            splitTitle = doc.splitTextToSize(
              users.data[i].ProjectSection.breadcrumbTitle,
              180
            );
            doc.text(10, 70, "Floor Number");
            doc.text(50, 70, splitTitle);
            splitTitle = doc.splitTextToSize(shapesparkLink, 180);
            doc.text(10, 80, "Video Link");
            doc.text(50, 80, splitTitle);
            doc.addImage("./images/Quadrangle/1.png", "PNG", 8, 90, 192, 108);
            doc.save("a4.pdf");


}
*/
/*
function viewPaymentPlan() {
 // document.getElementById("planImage").hidden = "";
  document.getElementById("ImagePayment-section").hidden = "";
}*/

/////////////////////Gallery


    var slideIndex = 1;
    showSlides(slideIndex);

    function plusSlides(n) {
      const iframeVideos = document.querySelectorAll("iframe");

  if (iframeVideos.length > 0) {
    iframeVideos.forEach((iframe) => {
      if (iframe.contentWindow) {
        // Pause Youtube Videos
        if (iframe.src.startsWith("https://www.youtube.com")) {
          iframe.contentWindow.postMessage(
            '{"event":"command","func":"pauseVideo","args":""}',
            "*"
          );
        }
      }
    });
  }
      showSlides((slideIndex += n));
    }

    function currentSlide(n) {
      showSlides((slideIndex = n));
    }

    function showSlides(n) {
      var i;
      var slides = document.getElementsByClassName("mySlides");
      var dots = document.getElementsByClassName("demo");
      var captionText = document.getElementById("caption");
      if (n > slides.length) {
        slideIndex = 1;
      }
      if (n < 1) {
        slideIndex = slides.length;
      }
      for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
      }
      for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
      }
      slides[slideIndex - 1].style.display = "block";
      dots[slideIndex - 1].className += " active";
      captionText.innerHTML = dots[slideIndex - 1].alt;
    }


//embeding behance
/*
 $(document).ready(function () {
        $(".behance-container").embedBehance({
          // behance API Key
          apiKey: "wiwQqudJqtfJZJ9U2NEuGzjXg9o59a8j",

          // Behance Username
          userName: "ZameenStudios",
          infiniteScrolling: true,
        });
      });



 var _gaq = _gaq || [];
      _gaq.push(["_setAccount", "UA-36251023-1"]);
      _gaq.push(["_setDomainName", "jqueryscript.net"]);
      _gaq.push(["_trackPageview"]);

      (function () {
        var ga = document.createElement("script");
        ga.type = "text/javascript";
        ga.async = true;
        ga.src =
          ("https:" == document.location.protocol
            ? "https://ssl"
            : "http://www") + ".google-analytics.com/ga.js";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(ga, s);
      })();



      */