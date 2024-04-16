const loadImage = async (imageURL) => {
  const imageName = new URL(imageURL).pathname.split("/")[1];
  const imgElement = new Image();
  imgElement.src = imageURL;
  imgElement.alt = imageName;

  const imgDiv = document.createElement("div");

  return new Promise((resolve) => {
    imgElement.addEventListener("load", () => {
      const label = document.createElement("label");
      label.textContent = imageName;
      const labelDiv = document.createElement("div");
      labelDiv.appendChild(label);
      imgDiv.appendChild(imgElement);
      imgDiv.appendChild(labelDiv);
      imgDiv.style = "padding: 0 16px;";
      resolve(imgDiv);
    });
  });
};

const getImages = async (url) => {
  // Fetch images directly from S3 bucket
  const response = await fetch(url);
  const images = await response.json();

  const promises = [];

  for (const image of images) {
    promises.push(loadImage(image));
  }

  return Promise.all(promises);
};

const loadImages = async () => {
  const imagesContainer = document.getElementById("images-container");
  const thumbnailsContainer = document.getElementById("thumbnails-container");
  document.getElementById("message").textContent = "Loading...";

  const [imageResult, thumbnailResult] = await Promise.allSettled([
    getImages("/api/images"),
    getImages("/api/thumbnails"),
  ]);

  document.getElementById("message").textContent = "";

  if (imageResult.status === "fulfilled") {
    imagesContainer.innerHTML = "";
    imagesContainer.append(...imageResult.value);
  }

  if (imageResult.status === "rejected") {
    console.error("Error fetching images:", imageResult.reason);
    const errorMessageDiv = document.createElement("div");
    errorMessageDiv.textContent = "Failed to load images";
    document.getElementById("message").append(errorMessageDiv);
  }

  if (thumbnailResult.status === "fulfilled") {
    thumbnailsContainer.innerHTML = "";
    thumbnailsContainer.append(...thumbnailResult.value);
  }

  if (thumbnailResult.status === "rejected") {
    console.error("Error fetching thumbnails:", thumbnailResult.reason);
    const errorMessageDiv = document.createElement("div");
    errorMessageDiv.textContent = "Failed to load thumbnails";
    document.getElementById("message").appendChild(errorMessageDiv);
  }
};

const handleFileUpload = async () => {
  document
    .getElementById("uploadForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      let formData = new FormData();
      // Get the specified imagename from the input field
      let imagename = document.getElementById("imageNameInput").value.trim();
      if (imagename) {
        formData.append("imagename", imagename);
      }
      formData.append("image", document.getElementById("imageInput").files[0]);
      console.log(document.getElementById("imageInput").files[0]);

      document.getElementById("message").textContent = "Loading...";

      fetch("/api/image", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to upload file.");
          }
          return response.text();
        })
        .then((message) => {
          document.getElementById("message").textContent = message;
          setTimeout(() => {
            loadImages();
          }, 2000);
        })
        .catch((error) => {
          document.getElementById("message").textContent = error.message;
        });
    });
};

document.getElementById("imageInput").addEventListener("change", function (ev) {
  document.querySelector("label[for='imageInput']").textContent =
    this.files[0].name;
});

loadImages();
handleFileUpload();
