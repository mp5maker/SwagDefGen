function init() {
  let txtArea = document.getElementById('JSON');
  txtArea.onkeydown = function (e) {
    if (e.keyCode == 9 || e.which == 9) {
      e.preventDefault();
      let s = this.selectionStart;
      this.value = this.value.substring(0, this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
      this.selectionEnd = s + 1;
    }
  }
};


function performAction() {
  const configuration = {
    noInt: document.getElementById("noInt").checked,
    requestExamples: document.getElementById("requestExamples").checked,
    nullType: document.getElementById("nullType").value,
    yamlOut: document.getElementById("yamlOut").checked,
  };
  const inJSON = document.getElementById("JSON").value;
  const output = convert({ inJSON, configuration });
  document.getElementById("Swagger").value = output;
}

window.addEventListener("load", (event) => {
  //Handle tabs inside JSON textarea
  init()

  // Handle the fields
  const options = ['requestExamples', 'noInt', 'nullType', 'yamlOut']
  options.forEach(
    option => document.getElementById(option).addEventListener("change", (event) => {
      if (event.target.type === 'checkbox') {
        if (!event.target.checked) {
          return localStorage.removeItem(option)
        }
        return localStorage.setItem(option, 1)
      }
      return localStorage.setItem(option, event.target.value);
    })
  )
  options.forEach(
    option => {
      const value = localStorage.getItem(option)
      const input = document.getElementById(option)

      if (value === null || !input) return
      if (input.type === 'checkbox') return input.checked = true
      return input.value = value
    }
  )

  // Handle Convert Clicked
  const convert = document.getElementById("convert");
  convert.addEventListener("click", () => {
    performAction();
  });
});
