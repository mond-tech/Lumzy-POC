"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import imagesLoaded from "imagesloaded";
import Splitting from "splitting";
import "splitting/dist/splitting.css";
import "splitting/dist/splitting-cells.css";

type Orientation = "vertical" | "horizontal";

type CardSettings = {
  orientation: Orientation;
  slicesTotal: number;
  animation?: {
    duration: number;
    ease: string;
  };
};

const lettersAndSymbols = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "-",
  "_",
  "+",
  "=",
  ";",
  ":",
  "<",
  ">",
  ",",
];

const preloadImages = (selector: string): Promise<void> => {
  return new Promise((resolve) => {
    (imagesLoaded as any)(
      document.querySelectorAll(selector),
      { background: true },
      () => resolve()
    );
  });
};

class HoverCard {
  private root: HTMLElement;
  private img: HTMLElement;
  private imgWrap!: HTMLElement;
  private slices!: NodeListOf<HTMLElement>;
  private dateEl: HTMLElement;
  private titleEl: HTMLElement;
  private linkEl: HTMLElement;
  private imageURL: string;
  private settings: Required<CardSettings>;
  private chars: {
    date: HTMLElement[];
    title: HTMLElement[];
    link: HTMLElement[];
  };

  constructor(el: HTMLElement, options: CardSettings) {
    this.settings = {
      orientation: options.orientation,
      slicesTotal: options.slicesTotal,
      animation: {
        duration: options.animation?.duration ?? 0.5,
        ease: options.animation?.ease ?? "power3.inOut",
      },
    };

    this.root = el;
    this.img = this.root.querySelector(".card__img") as HTMLElement;
    this.dateEl = this.root.querySelector(".card__date") as HTMLElement;
    this.titleEl = this.root.querySelector(".card__title") as HTMLElement;
    this.linkEl = this.root.querySelector(".card__link") as HTMLElement;

    this.chars = {
      date: Array.from(this.dateEl.querySelectorAll(".char")) as HTMLElement[],
      title: Array.from(this.titleEl.querySelectorAll(".char")) as HTMLElement[],
      link: Array.from(this.linkEl.querySelectorAll(".char")) as HTMLElement[],
    };

    [...this.chars.date, ...this.chars.title, ...this.chars.link].forEach(
      (char) => {
        (char as HTMLElement).dataset.initial = char.innerHTML;
      }
    );

    // Try data-img attribute first (most reliable with React)
    const dataImg = this.img.getAttribute("data-img") || "";
    if (dataImg) {
      this.imageURL = dataImg;
    } else {
      // Fallback: extract from computed style.backgroundImage
      const bgImg = this.img.style.backgroundImage || "";
      const match = bgImg.match(/url\(["']?(.*?)["']?\)/);
      this.imageURL = match ? match[1] : "";
    }

    this.layout();
    
    // Set initial state: hidden and moved
    const vertical = this.settings.orientation === "vertical";
    gsap.set(this.img, {
      [vertical ? "yPercent" : "xPercent"]: 100,
      opacity: 0,
    });
    gsap.set(this.imgWrap, {
      [vertical ? "yPercent" : "xPercent"]: -100,
    });

    this.initEvents();
  }

  private layout() {
    this.imgWrap = document.createElement("div");
    this.imgWrap.className = "card__img-wrap";

    let slicesStr = "";
    for (let i = 0; i < this.settings.slicesTotal; ++i) {
      slicesStr += `<div class="card__img-inner" style="background-image:url('${this.imageURL}')"></div>`;
    }
    this.imgWrap.innerHTML = slicesStr;
    this.slices = this.imgWrap.querySelectorAll(
      ".card__img-inner"
    ) as NodeListOf<HTMLElement>;
    this.img.appendChild(this.imgWrap);

    this.img.style.setProperty(
      this.settings.orientation === "vertical" ? "--columns" : "--rows",
      String(this.settings.slicesTotal)
    );

    this.setClipPath();
  }

  private setClipPath() {
    this.slices.forEach((slice, position) => {
      const a1 = (position * 100) / this.settings.slicesTotal;
      const b1 =
        (position * 100) / this.settings.slicesTotal +
        100 / this.settings.slicesTotal;

      const vertical = this.settings.orientation === "vertical";

      gsap.set(slice, {
        clipPath: vertical
          ? `polygon(${a1}% 0%, ${b1}% 0%, ${b1}% 100%, ${a1}% 100%)`
          : `polygon(0% ${a1}%, 100% ${a1}%, 100% ${b1}%, 0% ${b1}%)`,
      });
      // Ensure element is centered (removed position offset for 100% slices)
      gsap.set(slice, { [vertical ? "left" : "top"]: 0 });
    });
  }

  private shuffleChars(arr: HTMLElement[]) {
    arr.forEach((char) => {
      gsap.killTweensOf(char);
      gsap.fromTo(
        char,
        { opacity: 0 },
        {
          duration: 0.03,
          repeat: 3,
          repeatRefresh: true,
          opacity: 1,
          repeatDelay: 0.05,
          onUpdate: () => {
            const randomChar =
              lettersAndSymbols[
                Math.floor(Math.random() * lettersAndSymbols.length)
              ];
            (char as HTMLElement).innerHTML = randomChar;
          },
          onComplete: () => {
            (char as HTMLElement).innerHTML =
              (char as HTMLElement).dataset.initial || "";
          },
        }
      );
    });
  }

  private mouseEnter = () => {
    const vertical = this.settings.orientation === "vertical";

    this.shuffleChars(this.chars.date);
    this.shuffleChars(this.chars.title);
    this.shuffleChars(this.chars.link);

    gsap
      .timeline({
        defaults: {
          duration: this.settings.animation.duration,
          ease: this.settings.animation.ease,
        },
      })
      .addLabel("start", 0)
      .fromTo(
        this.img,
        {
          [vertical ? "yPercent" : "xPercent"]: 100,
          opacity: 0,
        },
        {
          [vertical ? "yPercent" : "xPercent"]: 0,
          opacity: 1,
        },
        "start"
      )
      .fromTo(
        this.imgWrap,
        {
          [vertical ? "yPercent" : "xPercent"]: -100,
        },
        {
          [vertical ? "yPercent" : "xPercent"]: 0,
        },
        "start"
      )
      .fromTo(
        this.slices,
        (() => {
          const base: Record<string, (pos: number) => number> = {
            [vertical ? "yPercent" : "xPercent"]: (pos: number) =>
              pos % 2
                ? (gsap.utils.random(-75, -25) as number)
                : (gsap.utils.random(25, 75) as number),
          };
          return base;
        })(),
        {
          [vertical ? "yPercent" : "xPercent"]: 0,
        },
        "start"
      );
  };

  private mouseLeave = () => {
    const vertical = this.settings.orientation === "vertical";

    gsap
      .timeline({
        defaults: {
          duration: this.settings.animation.duration,
          ease: this.settings.animation.ease,
        },
      })
      .addLabel("start", 0)
      .to(
        this.img,
        {
          [vertical ? "yPercent" : "xPercent"]: 100,
          opacity: 0,
        },
        "start"
      )
      .to(
        this.imgWrap,
        {
          [vertical ? "yPercent" : "xPercent"]: -100,
        },
        "start"
      )
      .to(
        this.slices,
        (() => {
          const base: Record<string, (pos: number) => number> = {
            [vertical ? "yPercent" : "xPercent"]: (pos: number) =>
              pos % 2
                ? (gsap.utils.random(-75, 25) as number)
                : (gsap.utils.random(25, 75) as number),
          };
          return base;
        })(),
        "start"
      );
  };

  private initEvents() {
    this.root.addEventListener("mouseenter", this.mouseEnter);
    this.root.addEventListener("mouseleave", this.mouseLeave);
  }
}

const settingsArray: CardSettings[] = [
  { orientation: "vertical", slicesTotal: 5 },
  { orientation: "vertical", slicesTotal: 15 },
  {
    orientation: "horizontal",
    slicesTotal: 5,
    animation: { duration: 0.6, ease: "expo.inOut" },
  },
  {
    orientation: "horizontal",
    slicesTotal: 15,
    animation: { duration: 0.6, ease: "expo.inOut" },
  },
];

const cardsData = [
  {
    img: "/ClipHoverEffect-main/img/img1.jpg",
    date: "02/18/2074",
    title: "Code CR-4519: Anomaly Detection in Array",
  },
  {
    img: "/ClipHoverEffect-main/img/img2.jpg",
    date: "02/20/2074",
    title: "Case Log 3X-782: Malfunction Analysis of Drone Units",
  },
  {
    img: "/ClipHoverEffect-main/img/img3.jpg",
    date: "03/17/2074",
    title: "Code CR-3037: Data Flow Optimization for Transmission",
  },
  {
    img: "/ClipHoverEffect-main/img/img4.jpg",
    date: "05/05/2074",
    title: "Code CR-9892: Investigation of Neural Network Anomalies",
  },
  {
    img: "/ClipHoverEffect-main/img/img5.jpg",
    date: "06/22/2074",
    title: "Maintenance Report 4B-678: Robotic Limb Performance Enhancement",
  },
  {
    img: "/ClipHoverEffect-main/img/img6.jpg",
    date: "07/02/2074",
    title:
      "Maintenance Report 9A-814: Diagnostics and Repair of Com Link 3C-12",
  },
  {
    img: "/ClipHoverEffect-main/img/img7.jpg",
    date: "08/14/2074",
    title: "Maintenance Report 7Y-246: Optimal Efficiency of ES Cells",
  },
  {
    img: "/ClipHoverEffect-main/img/img8.jpg",
    date: "09/30/2074",
    title: "Case Log 2Z-115: Cybersecurity Breach Detection",
  },
  {
    img: "/ClipHoverEffect-main/img/img9.jpg",
    date: "12/08/2074",
    title: "Case Log 6W-421: Resolving Power Surge Incidents in Subsystems",
  },
  {
    img: "/ClipHoverEffect-main/img/img1.jpg",
    date: "01/01/2075",
    title: "Incidence Report 2X-112: Station Uproar",
  },
  {
    img: "/ClipHoverEffect-main/img/img2.jpg",
    date: "01/26/2075",
    title: "Case Log 7S-336: Malfunction Analysis of Harvest Units",
  },
  {
    img: "/ClipHoverEffect-main/img/img3.jpg",
    date: "12/08/2074",
    title: "Case Log 2M-446: Solar Relay Optimization",
  },
];

export const SlicedImageHoverGrid: React.FC = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    Splitting({ target: rootRef.current.querySelectorAll("[data-splitting]") });

    const cardElements = Array.from(
      rootRef.current.querySelectorAll<HTMLElement>(".card")
    );

    cardElements.forEach((el, index) => {
      const settings =
        settingsArray[Math.floor(index / 3) % settingsArray.length];
      new HoverCard(el, settings);
    });

    preloadImages(".card__img").then(() => {
      document.body.classList.remove("loading");
    });
  }, []);

  return (
    <main ref={rootRef} className="sliced-hover-main">
      <div className="frame">
        <h1 className="frame__title">
          Clip-path Hover Effect from{" "}
          <a href="https://qu.ai/blog/" target="_blank" rel="noreferrer">
            Quai Network
          </a>
        </h1>
      </div>
      <div className="title">
        <span>Station</span> <span>Updates</span>
      </div>
      <p className="subtitle">
        ++ Each row of cards has a different image slice configuration ++
      </p>
      <section className="card-grid">
        {cardsData.map((card, idx) => (
          <article className="card" key={idx}>
            <div
              className="card__img"
              data-img={card.img}
              style={{ backgroundImage: `url(${card.img})` }}
            />
            <span className="card__date" data-splitting>
              {card.date}
            </span>
            <h2 className="card__title" data-splitting>
              {card.title}
            </h2>
            <a href="#" className="card__link" data-splitting>
              Read the article
            </a>
          </article>
        ))}
      </section>
    </main>
  );
};

export default SlicedImageHoverGrid;

