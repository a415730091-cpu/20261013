// 設定中文使用的字型
const CHINESE_FONT = "Noto Serif TC";

// 設定英文與數字使用的字型
const LATIN_FONT = "Bitcount Ink";

// 設定備用字型
const FALLBACK_FONT = "Noto Sans TC";

// 設定每次測驗要抽出的題目數量
const QUIZ_LENGTH = 5;

// 儲存完整題庫
let questionBank = [];

// 儲存本次隨機抽出的題目
let quizQuestions = [];

// 儲存目前題目編號
let currentQuestion = 0;

// 儲存答對題數
let score = 0;

// 儲存使用者選擇的選項
let selectedOption = -1;

// 儲存是否已經作答
let hasAnswered = false;

// 儲存測驗是否完成
let quizFinished = false;

// 儲存題庫是否載入完成
let dataLoaded = false;

// 儲存題庫載入失敗狀態
let dataLoadFailed = false;

// 儲存題庫錯誤訊息
let dataErrorMessage = "";

// 儲存選項區塊位置
let optionBoxes = [];

// 儲存下一題按鈕
const nextButton = {
  x: 0,
  y: 0,
  width: 180,
  height: 55
};

// 儲存重新開始按鈕
const restartButton = {
  x: 0,
  y: 0,
  width: 200,
  height: 55
};

// 在畫面建立之前載入 CSV 題庫
function preload() {
  // 使用 p5.js 的 loadTable 讀取 CSV 檔案
  loadTable(
    "questions.csv",
    "csv",
    "header",
    function(table) {
      // 將 CSV 資料轉換成題庫陣列
      parseQuestionTable(table);
    },
    function(error) {
      // 設定題庫讀取失敗狀態
      dataLoadFailed = true;

      // 儲存錯誤訊息
      dataErrorMessage = "無法讀取 questions.csv，請確認檔案位置是否正確。";

      // 在瀏覽器主控台顯示錯誤
      console.error(error);
    }
  );
}

// 設定畫布與基本畫面
function setup() {
  // 建立符合視窗大小的畫布
  createCanvas(windowWidth, windowHeight);

  // 設定像素密度
  pixelDensity(1);

  // 設定文字對齊方式
  textAlign(CENTER, CENTER);

  // 設定預設文字樣式
  textStyle(NORMAL);

  // 設定預設字型
  textFont(FALLBACK_FONT);

  // 如果題庫載入成功，就隨機抽取題目
  if (dataLoaded) {
    chooseQuestions();
  }
}

// 每一幀重新繪製畫面
function draw() {
  // 設定畫面背景顏色
  background("#f5f9fc");

  // 顯示題庫載入失敗畫面
  if (dataLoadFailed) {
    drawMessageScreen(dataErrorMessage);
    return;
  }

  // 顯示題庫載入中畫面
  if (!dataLoaded) {
    drawMessageScreen("題庫載入中，請稍候……");
    return;
  }

  // 顯示題庫題數不足畫面
  if (questionBank.length < QUIZ_LENGTH) {
    drawMessageScreen("題庫題目不足，至少需要 5 題。");
    return;
  }

  // 判斷測驗是否完成
  if (quizFinished) {
    // 繪製結果畫面
    drawResultScreen();
  } else {
    // 繪製題目畫面
    drawQuizScreen();
  }
}

// 解析 CSV 題庫
function parseQuestionTable(table) {
  // 取得 CSV 的所有資料列
  const rows = table.getRows();

  // 逐一處理每一列資料
  for (const row of rows) {
    // 讀取題目欄位
    const question = row.getString("question").trim();

    // 讀取第一個選項
    const optionA = row.getString("optionA").trim();

    // 讀取第二個選項
    const optionB = row.getString("optionB").trim();

    // 讀取第三個選項
    const optionC = row.getString("optionC").trim();

    // 讀取第四個選項
    const optionD = row.getString("optionD").trim();

    // 讀取答案欄位
    const answerText = row.getString("answer").trim().toUpperCase();

    // 將答案轉換成陣列索引
    const answerIndex = convertAnswerToIndex(answerText);

    // 檢查題目資料是否完整
    if (
      question !== "" &&
      optionA !== "" &&
      optionB !== "" &&
      optionC !== "" &&
      optionD !== "" &&
      answerIndex >= 0
    ) {
      // 將完整題目加入題庫
      questionBank.push({
        question: question,
        options: [optionA, optionB, optionC, optionD],
        answer: answerIndex
      });
    }
  }

  // 設定題庫載入完成
  dataLoaded = true;

  // 如果題庫足夠，就抽取題目
  if (questionBank.length >= QUIZ_LENGTH) {
    chooseQuestions();
  }
}

// 將 CSV 中的答案轉成選項索引
function convertAnswerToIndex(answerText) {
  // 如果答案是 A，就回傳索引 0
  if (answerText === "A" || answerText === "0") {
    return 0;
  }

  // 如果答案是 B，就回傳索引 1
  if (answerText === "B" || answerText === "1") {
    return 1;
  }

  // 如果答案是 C，就回傳索引 2
  if (answerText === "C" || answerText === "2") {
    return 2;
  }

  // 如果答案是 D，就回傳索引 3
  if (answerText === "D" || answerText === "3") {
    return 3;
  }

  // 如果答案格式錯誤，就回傳 -1
  return -1;
}

// 從題庫中不重複隨機抽出五題
function chooseQuestions() {
  // 複製完整題庫，避免改變原始題庫
  const shuffledQuestions = shuffle(questionBank.slice());

  // 取得前五題作為本次測驗題目
  quizQuestions = shuffledQuestions.slice(0, QUIZ_LENGTH);

  // 重設目前題目編號
  currentQuestion = 0;

  // 重設分數
  score = 0;

  // 清除選項選擇
  selectedOption = -1;

  // 設定尚未作答
  hasAnswered = false;

  // 設定測驗尚未完成
  quizFinished = false;
}

// 繪製載入或錯誤提示畫面
function drawMessageScreen(message) {
  // 設定提示文字顏色
  fill("#1d3557");

  // 移除文字外框
  noStroke();

  // 設定提示文字大小
  textSize(min(width * 0.05, 28));

  // 設定提示文字粗細
  textStyle(BOLD);

  // 繪製提示文字
  drawMixedText(message, width / 2, height / 2, textSize(), "center");
}

// 繪製測驗畫面
function drawQuizScreen() {
  // 取得目前題目
  const current = quizQuestions[currentQuestion];

  // 計算內容區域寬度
  const contentWidth = min(width - 40, 900);

  // 計算內容區域左側位置
  const contentX = (width - contentWidth) / 2;

  // 設定標題顏色
  fill("#1d3557");

  // 設定標題大小
  textSize(min(width * 0.06, 34));

  // 設定標題粗細
  textStyle(BOLD);

  // 繪製標題
  drawMixedText(
    "p5.js 簡易指令測驗",
    width / 2,
    45,
    textSize(),
    "center"
  );

  // 設定題數文字顏色
  fill("#457b9d");

  // 設定題數文字大小
  textSize(min(width * 0.04, 20));

  // 設定題數文字粗細
  textStyle(NORMAL);

  // 繪製題數文字
  drawMixedText(
    `第 ${currentQuestion + 1} 題／共 ${QUIZ_LENGTH} 題`,
    width / 2,
    88,
    textSize(),
    "center"
  );

  // 設定題目區塊高度
  const questionHeight = 120;

  // 設定題目區塊垂直位置
  const questionY = 115;

  // 設定題目背景顏色
  fill("#ffffff");

  // 設定題目外框顏色
  stroke("#c9d6e2");

  // 設定外框粗細
  strokeWeight(2);

  // 繪製題目區塊
  rect(contentX, questionY, contentWidth, questionHeight, 16);

  // 設定題目文字顏色
  fill("#1d3557");

  // 移除文字外框
  noStroke();

  // 設定題目文字大小
  textSize(min(width * 0.045, 25));

  // 設定題目文字粗細
  textStyle(BOLD);

  // 將題目換行
  const questionLines = wrapMixedText(
    current.question,
    contentWidth - 40,
    textSize()
  );

  // 繪製題目文字
  drawWrappedMixedText(
    questionLines,
    width / 2,
    questionY + questionHeight / 2,
    32,
    "center"
  );

  // 清空選項位置
  optionBoxes = [];

  // 計算選項起始位置
  const optionStartY = questionY + questionHeight + 30;

  // 判斷是否使用雙欄
  const isTwoColumns = width >= 700;

  // 設定選項間距
  const gap = 18;

  // 計算選項寬度
  const optionWidth = isTwoColumns
    ? (contentWidth - gap) / 2
    : contentWidth;

  // 設定選項高度
  const optionHeight = 90;

  // 逐一繪製四個選項
  for (let i = 0; i < current.options.length; i++) {
    // 計算選項欄位
    const column = isTwoColumns ? i % 2 : 0;

    // 計算選項列數
    const row = isTwoColumns ? floor(i / 2) : i;

    // 計算選項水平位置
    const optionX = contentX + column * (optionWidth + gap);

    // 計算選項原始垂直位置
    const baseY = optionStartY + row * (optionHeight + gap);

    // 設定選項垂直位置
    let optionY = baseY;

    // 判斷是否需要正確選項上下跳動
    if (
      hasAnswered &&
      selectedOption !== current.answer &&
      i === current.answer
    ) {
      // 產生上下跳動效果
      optionY += sin(frameCount * 0.15) * 10;
    }

    // 儲存選項位置
    optionBoxes.push({
      x: optionX,
      y: optionY,
      width: optionWidth,
      height: optionHeight
    });

    // 設定選項預設顏色
    let optionColor = "#ffffff";

    // 判斷是否為答錯後的正確選項
    if (
      hasAnswered &&
      selectedOption !== current.answer &&
      i === current.answer
    ) {
      // 設定正確選項背景顏色
      optionColor = "#caf0f8";
    }

    // 判斷是否為答對後的正確選項
    if (
      hasAnswered &&
      selectedOption === current.answer &&
      i === current.answer
    ) {
      // 設定答對選項背景顏色
      optionColor = "#d8f3dc";
    }

    // 判斷是否為使用者答錯的選項
    if (
      hasAnswered &&
      selectedOption === i &&
      selectedOption !== current.answer
    ) {
      // 設定錯誤選項背景顏色
      optionColor = "#ffd6d6";
    }

    // 設定選項背景顏色
    fill(optionColor);

    // 設定選項外框顏色
    stroke("#8aa9bd");

    // 設定選項外框粗細
    strokeWeight(2);

    // 繪製選項區塊
    rect(optionX, optionY, optionWidth, optionHeight, 14);

    // 設定選項文字顏色
    fill("#1d3557");

    // 移除文字外框
    noStroke();

    // 設定選項文字大小
    textSize(min(width * 0.038, 21));

    // 設定選項文字粗細
    textStyle(NORMAL);

    // 組合選項文字
    const optionText = `${String.fromCharCode(65 + i)}. ${current.options[i]}`;

    // 將選項文字換行
    const optionLines = wrapMixedText(
      optionText,
      optionWidth - 30,
      textSize()
    );

    // 繪製選項文字
    drawWrappedMixedText(
      optionLines,
      optionX + optionWidth / 2,
      optionY + optionHeight / 2,
      28,
      "center"
    );
  }

  // 判斷是否已作答
  if (hasAnswered) {
    // 設定回饋文字顏色
    fill(selectedOption === current.answer ? "#2a9d8f" : "#e76f51");

    // 設定回饋文字大小
    textSize(min(width * 0.04, 22));

    // 設定回饋文字粗細
    textStyle(BOLD);

    // 建立回饋文字
    const feedbackText =
      selectedOption === current.answer
        ? "答對了！"
        : "答錯了，正確答案已標示。";

    // 繪製回饋文字
    drawMixedText(
      feedbackText,
      width / 2,
      height - 125,
      textSize(),
      "center"
    );

    // 設定下一題按鈕水平位置
    nextButton.x = width / 2 - nextButton.width / 2;

    // 設定下一題按鈕垂直位置
    nextButton.y = height - 95;

    // 設定下一題按鈕顏色
    fill("#457b9d");

    // 移除按鈕外框
    noStroke();

    // 繪製下一題按鈕
    rect(
      nextButton.x,
      nextButton.y,
      nextButton.width,
      nextButton.height,
      12
    );

    // 設定按鈕文字顏色
    fill("#ffffff");

    // 設定按鈕文字大小
    textSize(20);

    // 設定按鈕文字粗細
    textStyle(BOLD);

    // 繪製下一題文字
    drawMixedText(
      "下一題",
      width / 2,
      nextButton.y + nextButton.height / 2,
      textSize(),
      "center"
    );
  }
}

// 繪製結果畫面
function drawResultScreen() {
  // 設定標題顏色
  fill("#1d3557");

  // 設定標題大小
  textSize(min(width * 0.08, 42));

  // 設定標題粗細
  textStyle(BOLD);

  // 繪製完成標題
  drawMixedText(
    "測驗完成！",
    width / 2,
    height * 0.25,
    textSize(),
    "center"
  );

  // 設定分數顏色
  fill("#2a9d8f");

  // 設定分數大小
  textSize(min(width * 0.1, 56));

  // 繪製答對題數
  drawMixedText(
    `${score}／${QUIZ_LENGTH} 題答對`,
    width / 2,
    height * 0.43,
    textSize(),
    "center"
  );

  // 設定鼓勵文字顏色
  fill("#457b9d");

  // 設定鼓勵文字大小
  textSize(min(width * 0.045, 24));

  // 設定文字粗細
  textStyle(NORMAL);

  // 設定預設鼓勵文字
  let encouragement = "再練習一次，你一定會更進步！";

  // 判斷是否全部答對
  if (score === QUIZ_LENGTH) {
    // 設定全部答對提示
    encouragement = "太棒了！全部答對！";
  } else if (score >= 3) {
    // 設定答對三題以上提示
    encouragement = "表現很好，繼續加油！";
  }

  // 繪製鼓勵文字
  drawMixedText(
    encouragement,
    width / 2,
    height * 0.54,
    textSize(),
    "center"
  );

  // 設定重新開始按鈕位置
  restartButton.x = width / 2 - restartButton.width / 2;

  // 設定重新開始按鈕位置
  restartButton.y = height * 0.65;

  // 設定重新開始按鈕顏色
  fill("#457b9d");

  // 繪製重新開始按鈕
  rect(
    restartButton.x,
    restartButton.y,
    restartButton.width,
    restartButton.height,
    12
  );

  // 設定按鈕文字顏色
  fill("#ffffff");

  // 設定按鈕文字大小
  textSize(20);

  // 設定按鈕文字粗細
  textStyle(BOLD);

  // 繪製重新開始文字
  drawMixedText(
    "重新開始",
    width / 2,
    restartButton.y + restartButton.height / 2,
    textSize(),
    "center"
  );
}

// 處理滑鼠點擊
function mousePressed() {
  // 判斷測驗是否完成
  if (quizFinished) {
    // 判斷是否點擊重新開始按鈕
    if (
      pointInRectangle(
        mouseX,
        mouseY,
        restartButton.x,
        restartButton.y,
        restartButton.width,
        restartButton.height
      )
    ) {
      // 重新抽取五題
      chooseQuestions();
    }

    // 結束滑鼠事件
    return;
  }

  // 判斷是否尚未作答
  if (!hasAnswered) {
    // 逐一檢查選項
    for (let i = 0; i < optionBoxes.length; i++) {
      // 取得目前選項位置
      const box = optionBoxes[i];

      // 判斷滑鼠是否點擊選項
      if (
        pointInRectangle(
          mouseX,
          mouseY,
          box.x,
          box.y,
          box.width,
          box.height
        )
      ) {
        // 儲存選項編號
        selectedOption = i;

        // 設定已經作答
        hasAnswered = true;

        // 判斷答案是否正確
        if (selectedOption === quizQuestions[currentQuestion].answer) {
          // 增加分數
          score++;
        }

        // 結束選項檢查
        break;
      }
    }
  } else {
    // 判斷是否點擊下一題按鈕
    if (
      pointInRectangle(
        mouseX,
        mouseY,
        nextButton.x,
        nextButton.y,
        nextButton.width,
        nextButton.height
      )
    ) {
      // 前往下一題
      goToNextQuestion();
    }
  }
}

// 前往下一題
function goToNextQuestion() {
  // 判斷是否為最後一題
  if (currentQuestion >= quizQuestions.length - 1) {
    // 設定測驗完成
    quizFinished = true;
  } else {
    // 題目編號加一
    currentQuestion++;

    // 清除選項
    selectedOption = -1;

    // 設定尚未作答
    hasAnswered = false;
  }
}

// 判斷座標是否位於矩形內
function pointInRectangle(
  pointX,
  pointY,
  rectangleX,
  rectangleY,
  rectangleWidth,
  rectangleHeight
) {
  // 回傳座標是否在矩形範圍內
  return (
    pointX >= rectangleX &&
    pointX <= rectangleX + rectangleWidth &&
    pointY >= rectangleY &&
    pointY <= rectangleY + rectangleHeight
  );
}

// 判斷字元是否為中文
function isChineseCharacter(character) {
  // 使用 Unicode 範圍判斷中文
  return /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/.test(character);
}

// 判斷字元是否為英文或數字
function isLatinOrNumber(character) {
  // 使用正規表示式判斷英文與數字
  return /[A-Za-z0-9]/.test(character);
}

// 取得字元對應字型
function getFontForCharacter(character) {
  // 判斷是否為中文
  if (isChineseCharacter(character)) {
    // 中文使用 Noto Serif TC
    return CHINESE_FONT;
  }

  // 判斷是否為英文或數字
  if (isLatinOrNumber(character)) {
    // 英文與數字使用 Bitcount Ink
    return `${LATIN_FONT}, ${FALLBACK_FONT}`;
  }

  // 標點符號使用 Noto Sans TC
  return FALLBACK_FONT;
}

// 將混合文字分成不同字型區段
function splitMixedText(inputText) {
  // 建立文字區段陣列
  const segments = [];

  // 儲存目前文字
  let currentText = "";

  // 儲存目前字型
  let currentFont = "";

  // 逐一處理每個字元
  for (const character of inputText) {
    // 取得目前字元的字型
    const characterFont = getFontForCharacter(character);

    // 判斷是否需要切換字型
    if (currentFont !== characterFont && currentText !== "") {
      // 儲存目前文字區段
      segments.push({
        text: currentText,
        font: currentFont
      });

      // 清空目前文字
      currentText = "";
    }

    // 設定目前字型
    currentFont = characterFont;

    // 加入目前字元
    currentText += character;
  }

  // 儲存最後一個文字區段
  if (currentText !== "") {
    // 加入最後一個文字區段
    segments.push({
      text: currentText,
      font: currentFont
    });
  }

  // 回傳文字區段
  return segments;
}

// 計算混合文字寬度
function measureMixedText(inputText, fontSize) {
  // 設定文字大小
  textSize(fontSize);

  // 儲存文字總寬度
  let totalWidth = 0;

  // 取得文字區段
  const segments = splitMixedText(inputText);

  // 逐一計算各區段寬度
  for (const segment of segments) {
    // 設定目前區段字型
    textFont(segment.font);

    // 累加區段寬度
    totalWidth += textWidth(segment.text);
  }

  // 回傳文字總寬度
  return totalWidth;
}

// 依照寬度將文字換行
function wrapMixedText(inputText, maxWidth, fontSize) {
  // 建立文字行陣列
  const lines = [];

  // 建立目前文字行
  let currentLine = "";

  // 逐字處理文字
  for (const character of inputText) {
    // 建立測試文字行
    const testLine = currentLine + character;

    // 判斷測試文字是否超出寬度
    if (
      measureMixedText(testLine, fontSize) > maxWidth &&
      currentLine !== ""
    ) {
      // 儲存目前文字行
      lines.push(currentLine);

      // 開始新的文字行
      currentLine = character;
    } else {
      // 將字元加入目前文字行
      currentLine = testLine;
    }
  }

  // 儲存最後一行文字
  if (currentLine !== "") {
    // 加入最後一行文字
    lines.push(currentLine);
  }

  // 回傳換行結果
  return lines;
}

// 繪製混合字型文字
function drawMixedText(inputText, centerX, centerY, fontSize, alignment) {
  // 設定文字大小
  textSize(fontSize);

  // 計算文字總寬度
  const totalWidth = measureMixedText(inputText, fontSize);

  // 設定文字起始位置
  let startX = centerX - totalWidth / 2;

  // 判斷是否靠右對齊
  if (alignment === "right") {
    // 將起始位置設定在右側
    startX = centerX - totalWidth;
  }

  // 儲存目前水平位置
  let currentX = startX;

  // 逐一繪製文字區段
  for (const segment of splitMixedText(inputText)) {
    // 設定目前區段字型
    textFont(segment.font);

    // 計算目前區段寬度
    const segmentWidth = textWidth(segment.text);

    // 繪製目前區段
    text(
      segment.text,
      currentX + segmentWidth / 2,
      centerY
    );

    // 移動到下一段文字位置
    currentX += segmentWidth;
  }
}

// 繪製多行混合字型文字
function drawWrappedMixedText(
  lines,
  centerX,
  centerY,
  lineHeight,
  alignment
) {
  // 計算文字總高度
  const totalHeight = lines.length * lineHeight;

  // 計算第一行垂直位置
  const firstLineY =
    centerY - totalHeight / 2 + lineHeight / 2;

  // 逐一繪製每一行
  for (let i = 0; i < lines.length; i++) {
    // 繪製目前文字行
    drawMixedText(
      lines[i],
      centerX,
      firstLineY + i * lineHeight,
      textSize(),
      alignment
    );
  }
}

// 當視窗大小改變時調整畫布
function windowResized() {
  // 將畫布調整為最新視窗大小
  resizeCanvas(windowWidth, windowHeight);
}