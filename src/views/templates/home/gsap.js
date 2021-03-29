// gsap.registerPlugin(ScrollTrigger);
// var action = gsap.timeline({
//     scrollTrigger: {
//       trigger: ".sec02",
//       start: "top center+=50px",
//       end: "+=100%",
//       scrub:0.2,
//       markers:true,
//       pin:".sec02"
//     }
//   }).set('.pancake-anim', {y:`-=100px`, opacity:0})
//   .to('.pancake-anim', {opacity:1, stagger:1, y:`+=100px`, duration:1, ease:'power3.out'})

//   ScrollTrigger.create({
//     trigger: ".sec02",
//     start: "top center-=50px",
//     end: "bottom center+=35px",
//     pin:'.wrap'
//   });
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

window.initPancake = () => {
    // let anims = '#pancakes image, .pancake-anim, #pancakes text, #pancakes tspan';
    let anims = '#pancakes .layah';

    var progress = 0;
    ScrollTrigger.addEventListener("refreshInit", function () {
        progress = document.documentElement.scrollTop / ScrollTrigger.maxScroll(window);
    });
    ScrollTrigger.addEventListener("refresh", function () {
        document.documentElement.scrollTop = progress * ScrollTrigger.maxScroll(window);
    });
    ScrollTrigger.config({
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load" // notice "resize" isn't in the list
    });
    // gsap.set('.pancake-anim', {
    //     opacity: 0
    // })
    gsap.set('#pancakes .layah', {
        opacity: 0

    })
    console.log($("#pancakes").height());
    // gsap.set('.pancake-text-wrapper .ant-row', {
    //     opacity: 0
    // })
    // var pancakes = $("#pancakes");
    let startPoint = false;
    if (navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i)) {
        console.log($(document).width());
        if ($(window).width() <= 768)
            startPoint = "+=100px";
    }
    var action = gsap.timeline({
            scrollTrigger: {
                trigger: "#ecommerce .container h3",
                start: "",
                end: `+=${$("#pancakes").height()}px`,
                scrub: 1,
                markers: true,
                // pin: "#ecommerce .container>.container",
                invalidateOnRefresh: true


            }
        }).set(anims, {
            // y: `-=${$(window).height()}px`,
            y: `-=${$("#pancakes").height()/2}px`,
            // y: `-=${$("#pancakes").height()}px`,


            opacity: 0
        })
        // .set('#pancakes image, .pancake-anim', {
        //     y: `-=${$(window).height()}`,
        //     opacity: 0
        // })
        .to(anims, {
            opacity: 0.8,
            stagger: 1,
            y: `+=${$("#pancakes").height()}px`,
            duration: 2,
            ease: 'power3.out'
        })
        .to(anims, {
            opacity: 1,
            stagger: 1,
            duration: 0.5
        })

        .to(anims, {
            opacity: 0,
            stagger: 0.5,
            y: `+=${$("#pancakes").height()}px`,
            duration: 1,
            ease: 'power3.out'
        })
    // .end(function (e) {

    //     $('html, body').animate(
    //       {
    //         scrollTop: $("#roadmap").offset().top,
    //       },
    //       500,
    //       'linear'
    //     )
    //   })

    // ScrollTrigger.create({
    //     trigger: "#ecommerce",
    //     start: startPoint ? startPoint : "top top",
    //     end: "bottom bottom-=60%",
    //     // pin: '.body-wrapper',
    //     markers: true,
    //     invalidateOnRefresh: true

    //     // markers: true,
    //     // snap: {
    //     //     snapTo: 0.8, // 0.5 'cause the scroll animation range is 200vh for parallax effect
    //     //     duration: 1,
    //     //     ease: 'power4.inOut'
    //     // }
    // });

}