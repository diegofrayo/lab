document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("example-8")
    .querySelectorAll(".my-element")
    .forEach((item) => {
      // animationend, animationstart, animationiteration
      item.addEventListener("animationend", (event) => {
        const element = event.currentTarget;
        element.innerText = `Animation finished ${event.animationName}`;
        element.style.width = "85%";
        element.style.borderRadius = 0;
      });
    });

  // example 9 - Animations with JS
  (() => {
    const container = document.getElementById("example-9");

    // element.animate(keyframes = [], option = {})
    const animation = container.querySelectorAll(".my-element")[0].animate(
      [
        // from
        {
          transform: "translateX(0)",
        },
        // to
        {
          transform: "translateX(50px)", // 250
        },
      ],
      {
        delay: 1000,
        direction: "alternate",
        duration: 1000,
        easing: "linear",
        fill: "forwards",
        iterations: Infinity,
        iterationStart: 0.5, // = 50%
        // endDelay: 5000,
      }
    );

    const playButton = container.querySelectorAll("#play")[0];
    const pauseButton = container.querySelectorAll("#pause")[0];
    const stopButton = container.querySelectorAll("#stop")[0];

    playButton.addEventListener("click", (event) => animation.play());
    pauseButton.addEventListener("click", (event) => animation.pause());
    stopButton.addEventListener("click", (event) => animation.cancel());
  })();
});
