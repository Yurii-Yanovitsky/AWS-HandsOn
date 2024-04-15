const bucketName = "yanovitsky-demo1-s3";
const bucketUrl = `https://${bucketName}.s3.amazonaws.com`;

const loadImage = async (bucketUrl, key) => {
  const imageUrl = `${bucketUrl}/${encodeURIComponent(key)}`;
  const image = new Image();
  image.src = imageUrl;
  image.alt = key;

  await new Promise((resolve) => {
    image.addEventListener("load", () => {
      resolve(image);
    });
  });

  return image;
};

const loadImages = async () => {
  const messageElement = document.getElementById("message");
  messageElement.textContent = "Loading...";

  // Fetch images directly from S3 bucket
  fetch(bucketUrl)
    .then((response) => response.text())
    .then(async (xmlText) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "application/xml");
      const keys = xmlDoc.getElementsByTagName("Key");

      const promises = [];

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i].textContent;
        promises.push(loadImage(bucketUrl, key));
      }

      const images = await Promise.all(promises);
      const imagesContainer = document.getElementById("images-container");
      imagesContainer.innerHTML = "";

      for (const image of images) {
        const imageDiv = document.createElement("div");
        const label = document.createElement("label");
        label.textContent = image.alt;
        const labelDiv = document.createElement("div");
        labelDiv.appendChild(label);
        imageDiv.appendChild(image);
        imageDiv.appendChild(labelDiv);
        imagesContainer.appendChild(imageDiv);
      }

      messageElement.textContent = "";
    })
    .catch((error) => {
      console.error("Error fetching images:", error);
      messageElement.textContent = "Failed to load images";
    });
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
      
      fetch("/", {
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
          loadImages();
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
