$("#user-model-button").click(function() {
  $("#image-data").show();
});

var no_l = 10;
var imdata;
var xs_test;
let results;
let pred_res;
let x_temp1;
let y_temp1;

let num_img = 0;
let img_class;
let img_dim;
let count;
let sum_count;
var ch;
function addImageProcess(src) {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
async function dataImg(event) {
  var files = event.target.files;
  x_temp1 = new Array();
  y_temp1 = new Array();
  num_img = files.length;
  img_dim = new Array();

  for (var i = 0; i < files.length; i++) {
    let src;
    var file = files[i];
    var res = file.name.substring(0, 3);
    if (res == "cat") {
      y_temp1.push(parseInt(1));
    } else {
      y_temp1.push(parseInt(0));
    }
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async function() {
      let dataURL = reader.result;
      src = dataURL;
      let l_img = await addImageProcess(src);
      img_h = l_img.height;
      img_b = l_img.width;
      img_dim.push([img_h, img_b]);
      var c = document.getElementById("myCanvas1");
      var context = c.getContext("2d");
      context.drawImage(l_img, 0, 0, img_h, img_b);
      let imgData = context.getImageData(0, 0, img_h, img_b);
      const imgt = tf.browser.fromPixels(imgData).toFloat();
      var imgt1 = imgt.dataSync();

      x_temp1.push(imgt1);
    };
  }
  alert(num_img + " images loaded !");
  console.log(x_temp1);
}
$("#ima").change(async function(event) {
  $("#loader").show();
  await dataImg(event);

  $("#detect").show();
  $("#finalImg").html("");
  $("#draw").hide();
  $("#choices").hide();
  $("#res").hide();
  $("#loader").hide();
});
let prediction;
$("#detect-button").click(async function() {
  $("#loader").show();
  await detectObj();

  ch = "null";
  $("#loader").hide();
});
function foo(arr) {
  var a = [],
    b = [],
    prev;

  arr.sort();
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] !== prev) {
      a.push(arr[i]);
      b.push(1);
    } else {
      b[b.length - 1]++;
    }
    prev = arr[i];
  }

  return [a, b];
}

async function detectObj() {
  prediction = new Array();
  img_class = new Array();
  counts = new Array();

  let model = await cocoSsd.load();
  for (var k = 0; k < num_img; k++) {
    let xs1 = tf.tensor1d(x_temp1[k]);

    xs = xs1.as3D(img_dim[k][1], img_dim[k][0], 3);
    console.log(xs);
    xs1.dispose();
    var pred = await model.detect(xs);
    prediction.push(pred);
    xs.dispose();
    for (var i = 0; i < pred.length; i++) {
      img_class.push(pred[i].class);
    }
  }
  model.dispose();
  counts = foo(img_class);
  sum_count = counts[1].reduce((a, b) => a + b, 0);
  if (sum_count == 0) {
    alert("No objects found");
  } else {
    $("#results").html("<li>Total Objects detected : " + sum_count + "</li>");
    $("#choice").html("");

    for (var j = 0; j < counts[0].length; j++) {
      $("#results").append(
        "<li>" + counts[0][j] + " : " + counts[1][j] + "</li>"
      );

      $("#choice").append(
        '<input type="radio" value= ' +
          counts[0][j] +
          " id= class" +
          j +
          ' name = "choice" />' +
          counts[0][j] +
          "<br/>"
      );
    }
    $("#draw").show();
    $("#choices").show();
    $("#res").show();
  }
}

$("#draw-button").click(async function() {
  ch = $("input[name=choice]:checked", "#choice").val();
  console.log(ch);
  await drawImg(ch);
});
$("#down-button").click(async function() {
  await downloadImg();
});

async function drawImg(cho) {
  $("#finalImg").html("");
  if (cho == undefined) {
    alert("Please choose a class");
  } else {
    for (var j = 0; j < num_img; j++) {
      let f = 0;
      for (var i = 0; i < prediction[j].length; i++) {
        if (prediction[j][i].class == cho) {
          f = f + 1;
        }
      }
      if (f > 0) {
        var canvas1 = $("<canvas/>", {
          id: "mycanvas" + j,
          height: img_dim[j][0],
          width: img_dim[j][1]
        });
        $("#finalImg").append(canvas1);
        $("#finalImg").append("<br / >");
      }
    }
    for (var j = 0; j < num_img; j++) {
      let f = 0;
      for (var i = 0; i < prediction[j].length; i++) {
        if (prediction[j][i].class == cho) {
          f = f + 1;
        }
      }
      if (f > 0) {
        let xs1 = tf.tensor1d(x_temp1[j]);
        xs = xs1.as3D(img_dim[j][1], img_dim[j][0], 3);
        var canvas = document.getElementById("mycanvas" + j);
        var ctx = canvas.getContext("2d");
        var w = img_dim[0][1];
        var h = img_dim[0][0];
        await tf.browser.toPixels(xs, canvas);
        xs1.dispose();
        xs.dispose();
      }
      for (var i = 0; i < prediction[j].length; i++) {
        if (prediction[j][i].class == cho) {
          const x = prediction[j][i].bbox[0];
          const y = prediction[j][i].bbox[1];
          const width = prediction[j][i].bbox[2];
          const height = prediction[j][i].bbox[3];
          ctx.strokeStyle = "#2fff00";
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);
        }
      }
    }
    $("#down").show();
  }
}

function convertCanvasToImage(canvas) {
  var image = new Image();
  image.src = canvas.toDataURL("image/png");
  return image;
}
function getBase64Image(img) {
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  var dataURL = canvas.toDataURL("image/png");
  return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

async function downloadImg() {
  var img9 = new Array();
  var lab = new Array();
  for (var j = 0; j < num_img; j++) {
    for (var i = 0; i < prediction[j].length; i++) {
      if (prediction[j][i].class == ch) {
        var canvas = document.getElementById("myCanvas2");
        canvas.width = prediction[j][i].bbox[2];
        canvas.height = prediction[j][i].bbox[3];
        var ctx = canvas.getContext("2d");
        var c = document.getElementById("mycanvas" + j);
        ctx.drawImage(
          c,
          prediction[j][i].bbox[0],
          prediction[j][i].bbox[1],
          prediction[j][i].bbox[2],
          prediction[j][i].bbox[3],
          0,
          0,
          prediction[j][i].bbox[2],
          prediction[j][i].bbox[3]
        );

        img9.push(
          canvas.toDataURL().replace(/^data:image\/(png|jpg);base64,/, "")
        );
        lab.push(prediction[j][i].class);
      }
    }
  }
  console.log(lab.length);
  var zip = new JSZip();
  zip.folder("images");
  var img = zip.folder("images");

  for (var i = 0; i < lab.length; i++) {
    console.log("aa");
    img.file(lab[i] + i + ".png", img9[i], { base64: true });
  }
  zip.generateAsync({ type: "blob" }).then(function(content) {
    saveAs(content, "download.zip");
  });
}

$("#image-selector").change(function() {
  let reader = new FileReader();
  reader.onload = function() {
    let dataURL = reader.result;
    $("#selected-image").attr("src", dataURL);
    $("#predictiob-list").empty();
  };

  let file = $("#image-selector").prop("files")[0];
  reader.readAsDataURL(file);
});

$("#predict-button").click(function() {
  let img = $("#selected-image").get(0);

  cocoSsd.load().then(model => {
    model.detect(img).then(predictions => {
      console.log("Predictions: ", predictions);

      var c = document.getElementById("myCanvas");
      var context = c.getContext("2d");
      var img1 = $("#selected-image").get(0);
      context.drawImage(img1, 0, 0);
      var canvas = document.getElementById("myCanvas");
      var ctx = canvas.getContext("2d");
      const font = "24px helvetica";
      ctx.font = font;
      ctx.textBaseline = "top";
      var image_class = document.getElementById("image_class");
      ctx.clearRect(0, 0, ctx.width, ctx.height);
      predictions.forEach(prediction => {
        if (prediction.class == image_class.value) {
          const x = prediction.bbox[0];
          const y = prediction.bbox[1];
          const width = prediction.bbox[2];
          const height = prediction.bbox[3];
          // Draw the bounding box.
          ctx.strokeStyle = "#2fff00";
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, width, height);
          // Draw the label background.
          ctx.fillStyle = "#2fff00";
          const textWidth = ctx.measureText(prediction.class).width;
          const textHeight = parseInt(font, 10);
          // draw top left rectangle
          ctx.fillRect(x, y, textWidth + 10, 5 * (textHeight + 10));
          // draw bottom left rectangle
          ctx.fillRect(
            x,
            y + height - textHeight,
            textWidth + 15,
            textHeight + 10
          );

          // Draw the text last to ensure it's on top.
          ctx.fillStyle = "#000000";
          ctx.fillText(prediction.class, x, y);
          ctx.fillStyle = "#000000";
          ctx.fillText(Math.round(x), x, y + (textHeight + 10));
          ctx.fillStyle = "#000000";
          ctx.fillText(Math.round(y), x, y + 2 * (textHeight + 10));
          ctx.fillStyle = "#000000";
          ctx.fillText(Math.round(height), x, y + 3 * (textHeight + 10));
          ctx.fillText(Math.round(width), x, y + 4 * (textHeight + 10));
          ctx.fillText(prediction.score.toFixed(2), x, y + height - textHeight);
        }
      });
    });
  });
});
