export function render() {
  document.getElementById("content").innerHTML = `
    <div class="card">
      <h3>Apply Now</h3>
      <select>
        <option>Rider</option>
        <option>Restaurant</option>
        <option>Job</option>
      </select><br><br>
      <input placeholder="Name"><br><br>
      <input placeholder="Mobile"><br><br>
      <input placeholder="Email"><br><br>
      <button>Submit</button>
    </div>
  `;
}
