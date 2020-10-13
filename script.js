class ObserverList {
  constructor() {
    this.observerList = [];
  }

  add(observer) {
    return this.observerList.push(observer);
  }

  get(index) {
    if (index > -1 && index < this.observerList.length) {
      return this.observerList[index];
    }
  }

  removeAt(index) {
    this.observerList.splice(index, 1);
  }

  count() {
    return this.observerList.length;
  }

  indexOf(observer, startIndex = 0) {
    let currentIndex = startIndex;

    while (currentIndex < this.observerList.length) {
      if (this.observerList[currentIndex] === observer) {
        return currentIndex;
      }
      currentIndex++;
    }

    return -1;
  }
}

//********************** The Subject  **********************//

class Subject {
  constructor() {
    this.observers = new ObserverList();
  }

  addObserver(observer) {
    this.observers.add(observer);
  }

  removeObserver(observer) {
    this.observers.removeAt(this.observers.indexOf(observer, 0));
  }

  notify(context) {
    const observerCount = this.observers.count();
    for (let i = 0; i < observerCount; i++) {
      this.observers.get(i).update(context);
    }
  }
}

//********************** The Observer  **********************//
class Observer {
  constructor() {}
  update() {}
}

//********************** The Concrete Subject  **********************//
class Track extends Subject {
  constructor(element) {
    super();
    this.element = element;
    this.isMute = false;
    this.isSolo = false;

    this.element.onclick = (e) => {
      // Clicking the mute button will trigger notifications to the track's observers
      if (e.target.classList.contains("mute-button")) {
        this.setMuteStatus();
        this.toggleActiveStatus(e);
        this.notify({
          button: "mute",
          status: this.isMute,
        });
      }

      // Clicking the solo button will trigger notifications to the track's observers
      if (e.target.classList.contains("solo-button")) {
        this.setSoloStatus();
        this.toggleActiveStatus(e);
        this.notify({
          button: "solo",
          status: this.isSolo,
        });
      }
    };
  }
  toggleActiveStatus(e) {
    e.target.classList.toggle("active");
  }

  setMuteStatus() {
    this.isMute = this.isMute ? false : true;
  }
  setSoloStatus() {
    this.isSolo = this.isSolo ? false : true;
  }
}

//********************** The Concrete Observer  **********************//
class Step extends Observer {
  constructor(element) {
    super();
    this.element = element;

    this.element.onclick = (e) => {
      this.toggleActiveStatus(e);
    };
  }

  toggleActiveStatus(e) {
    e.target.classList.toggle("active");
  }

  // Override with custom update behaviour
  update({ button, status }) {
    if (button === "mute") {
      // mute all the steps
      status
        ? this.element.classList.add("mute")
        : this.element.classList.remove("mute");
      console.log(this.element.classList);
    }

    if (button === "solo") {
      // solo all the steps
      status
        ? this.element.classList.add("solo")
        : this.element.classList.remove("solo");
      console.log(this.element.classList);
    }
  }
}

//*******************************************************//
//
// Sample application
//
//*******************************************************//

class Sequencer {
  constructor(element, nOfSteps, tracks) {
    this.element = element;
    this.nOfSteps = nOfSteps;
    this.steps = Array.from({ length: this.nOfSteps }, (_, i) => i + 1);
    this.tracks = tracks;
    this.registeredTracks = [];
  }

  renderHtmlTracks() {
    this.tracks.forEach((track) => {
      let markup = `
      <div class="track-controls">
        <p class="track-name">${track}</p>
        <button id="${track}MuteBtn" class="mute-button">M</button>
        <button id="${track}SoloBtn" class="solo-button">S</button>
      </div>
        <div class="track-steps" id="${track}TrackSteps"></div>
      </div>`;

      let div = document.createElement("div");
      div.className = "track";
      div.id = track + "Track";
      div.innerHTML = markup;
      this.element.appendChild(div);
    });
  }

  renderHtmlSteps() {
    this.tracks.forEach((track) => {
      let container = document.getElementById(`${track}TrackSteps`);
      this.steps.forEach((step) => {
        let div = document.createElement("div");
        div.className = "step";
        div.id = track + "Trackstep" + step;
        container.appendChild(div);
      });
    });
  }

  createConcreteSubjects() {
    this.tracks.forEach((track) => {
      this.registeredTracks.push(
        new Track(document.getElementById(`${track}Track`))
      );
    });
  }

  createConcreteObservers() {
    this.registeredTracks.forEach((track) => {
      for (let i = 1; i <= this.nOfSteps; i++) {
        track.addObserver(
          new Step(document.getElementById(`${track.element.id}step${i}`))
        );
      }
    });
  }

  renderTrack(trackName) {
    let markup = `
    <div class="track-controls">
        <p class="track-name">${trackName}</p>
        <button id="${trackName}MuteBtn" class="mute-button">M</button>
        <button id="${trackName}SoloBtn" class="solo-button">S</button>
      </div>
        <div class="track-steps" id="${trackName}TrackSteps"></div>
      </div>`;
    let div = document.createElement("div");
    div.className = "track";
    div.id = trackName + "Track";
    div.innerHTML = markup;
    this.element.appendChild(div);
  }

  renderSteps(trackName) {
    let container = document.getElementById(`${trackName}TrackSteps`);
    this.steps.forEach((step) => {
      let div = document.createElement("div");
      div.className = "step";
      div.id = trackName + "Trackstep" + step;
      container.appendChild(div);
    });
  }

  addNewTrack(trackName) {
    this.renderTrack(trackName);
    this.renderSteps(trackName);
    this.registeredTracks.push(
      this.addConcreteObserver(
        new Track(document.getElementById(`${trackName}Track`))
      )
    );
  }

  addConcreteObserver(track) {
    this.steps.forEach((step) => {
      track.addObserver(
        new Step(document.getElementById(`${track.element.id}step${step}`))
      );
    });
  }
}

let sequencer = new Sequencer(document.getElementById("sequencer"), 8, [
  "kick",
  "snare",
  "hi-hat",
  "crash",
]);

sequencer.renderHtmlTracks();
sequencer.renderHtmlSteps();
sequencer.createConcreteSubjects();
sequencer.createConcreteObservers();

sequencer.addNewTrack("bell");
