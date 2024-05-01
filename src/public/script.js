const access_token = new URL(window.location.href).searchParams.get(
  "access_token"
);

const getUser = async (url) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch username.");
  }

  return response.text();
};

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
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  const images = await response.json();

  const promises = [];

  for (const image of images) {
    promises.push(loadImage(image));
  }

  return Promise.all(promises);
};

const printMessage = (message) => {
  const messageDiv = document.createElement("div");
  messageDiv.textContent = message;
  document.getElementById("message").append(messageDiv);
};

const clearMessageBoard = () => {
  document.getElementById("message").innerHTML = "";
};

const loadAppData = async () => {
  clearMessageBoard();
  const imagesContainer = document.getElementById("images-container");
  const thumbnailsContainer = document.getElementById("thumbnails-container");
  printMessage("Loading started...");

  const [imageResult, thumbnailResult, userResult] = await Promise.allSettled([
    getImages("/api/images"),
    getImages("/api/thumbnails"),
    getUser(`/api/user`),
  ]);

  if (imageResult.status === "fulfilled") {
    imagesContainer.innerHTML = "";
    imagesContainer.append(...imageResult.value);
    printMessage("Images fetched successfully!");
  }

  if (imageResult.status === "rejected") {
    console.error("Error fetching images:", imageResult.reason);
    printMessage("Failed to load images!");
  }

  if (thumbnailResult.status === "fulfilled") {
    thumbnailsContainer.innerHTML = "";
    thumbnailsContainer.append(...thumbnailResult.value);
    printMessage("Thumbnails fetched successfully!");
  }

  if (thumbnailResult.status === "rejected") {
    console.error("Error fetching thumbnails:", thumbnailResult.reason);
    printMessage("Failed to load thumbnails");
  }

  if (userResult.status === "fulfilled") {
    document.getElementById("username").textContent = userResult.value;
    printMessage("User name fetched successfully!");
  }

  if (userResult.status === "rejected") {
    console.error("Error fetching user name:", userResult.reason);
    printMessage(userResult.reason);
  }

  printMessage("Loading finished.");
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
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        body: formData,
      })
        .then(async (response) => {
          if (!response.ok) {
            if (response.status === 403) {
              throw new Error("Access Forbidden For Your User Group.");
            }

            throw new Error("Failed to upload image.");
          }

          return response.text();
        })
        .then((message) => {
          document.getElementById("message").textContent = message;
          setTimeout(() => {
            loadAppData();
          }, 2000);
        })
        .catch((error) => {
          document.getElementById("message").textContent = error.message;
        });
    });
};

const main = () => {
  // For the sake of the script to be parsed immediately when it's encountered by the browser
  // and to have the ability to redirect immediately  if the access token hasn't been passed
  if (access_token) {
    document.addEventListener("DOMContentLoaded", () => {
      document
        .getElementById("imageInput")
        .addEventListener("change", function (ev) {
          document.querySelector("label[for='imageInput']").textContent =
            this.files[0].name;
        });

      handleFileUpload();
      loadAppData();
    });
  } else {
    window.location.href = "/auth";
  }
};

main();
