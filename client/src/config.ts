export const config = {
  defaults: {
    wsConnection: "ws://localhost:3080",
    heartbeatTime: 5000,
    activePeerTimeout: 10000,
    wolfLogo: "https://cdn.prod.website-files.com/6260298eca091b57c9cf188e/6260298eca091b8710cf18ea_logo.svg",
    defaultText: `

  // TypeScript Inheritance

  // One of the most fundamental patterns in class-based programming is being able to extend existing classes to create new ones using inheritance.
  // https://www.typescriptlang.org/docs/handbook/classes.html#inheritance


  class Animal {
    move(distanceInMeters: number = 0) {
      console.log(\`Animal moved \$\{distanceInMeters\}m.\`);
    }
  }


  class Dog extends Animal {
    bark() {
      console.log("Woof! Woof!");
    }
  }


  const dog = new Dog();
  dog.bark();
  dog.move(10);
  dog.bark();

`,
    cursorColors: [
      "#F94144", "#F3722C", "#F8961E", "#F9844A", "#F9C74F", "#90BE6D", "#43AA8B", "#4D908E", "#577590", "#277DA1", "#005F73", "#0A9396", "#94D2BD", "#EE9B00", "#CA6702",
      "#BB3E03", "#AE2012", "#9B2226", "#335C67", "#66827A", "#99A88C", "#C9C390", "#EBB639", "#D5883F", "#CA703F", "#9E2A2B", "#680929", "#FF2A2E", "#FF9F10", "#829521", "#315F8E",
      "#634174", "#40798C", "#3D2645", "#CC5803", "#474B24", "#00615C", "#3B9259", "#103D34", "#008482", "#96A540", "#AC5D45", "#9C5A6C", "#7472A0", "#CF0C70", "#E7409E", "#DE2928",
      "#2E294E", "#398D4F", "#0A95B1", "#346BE5", "#C62828", "#AD1457", "#6A1B9A", "#4527A0", "#283593", "#1565C0", "#0277BD", "#00838F", "#00695C", "#2E7D32", "#558B2F", "#9E9D24",
      "#F9A825", "#FF8F00", "#EF6C00", "#D84315", "#4E342E", "#424242", "#37474F",
    ]
  }
}