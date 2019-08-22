import React, { Component } from "react";
import bible from "./ko_ko.json";
import "./App.css";

class App extends Component {
  state = {
    data: [],
    book: 0,
    chapter: 0,
    verseS: 0,
    verseE: 0,
    view: false,
    bookData: [],
    verseData: [],
    selection: []
  };

  constructor() {
    super();
    this._result = this._result.bind(this);
  }

  componentDidMount() {
    document.title = "바이블 검색 페이지";
  }

  //구약 성경 불러와서 state data 갱신
  _loadingOT = async () => {
    let temp = [];
    for (let i = 0; i < 39; ++i) {
      temp.push(bible[i]);
    }
    this.setState({
      data: temp,
      book: 0,
      chapter: 0,
      verseS: 0,
      verseE: 0,
      view: false,
      verseData: [],
      book_name: null
    });
  };

  //신약 성경 불러와서 state data 갱신
  _loagingNT = async () => {
    let temp = [];
    for (let i = 39; i < 66; ++i) {
      temp.push(bible[i]);
    }
    this.setState({
      data: temp,
      book: 0,
      chapter: 0,
      verseS: 0,
      verseE: 0,
      view: false,
      verseData: []
    });
  };

  //성경 선택하면 state에 성경 이름과 id를 갱신
  _selectBook = event => {
    let n = event.target.id;
    if (n > 39) {
      n = n - 40;
    } else {
      n = n - 1;
    }

    if (this.state.view) {
      this._clearInput();
    }
    this.setState({
      book: event.target.id,
      bookName: this.state.data[n].book_name,
      bookData: this.state.data[n],
      view: false,
      verseData: []
    });
  };

  //구약, 신약 선택 후 각 성경 리스트 버튼으로 리턴
  _displayData = () => {
    const items = this.state.data.map(data => {
      return (
        <button
          className="book"
          id={data.book_nr}
          key={data.book_nr}
          onClick={this._selectBook}
        >
          {data.book_name}
        </button>
      );
    });
    return items;
  };

  //성경을 선택하면 장, 절 입력 화면 출력
  _chapterVerse = () => {
    return (
      <div>
        <span id="bookinfo">{this.state.bookName}</span>
        <br />
        <form onSubmit={this._result}>
          <label>
            <input
              type="number"
              pattern="\d*"
              name="chapterNum"
              id="chapterNum"
              required="required"
              content="user-scalable=no"
            />
            장
          </label>
          <label>
            <input
              type="number"
              pattern="\d*"
              name="verseStart"
              id="verseStart"
              content="user-scalable=no"
            />
            절~
          </label>
          <label>
            <input
              type="number"
              pattern="\d*"
              name="verseEnd"
              id="verseEnd"
              content="user-scalable=no"
            />
            절
          </label>
          <input type="submit" id="viewSubmit" value="보기" />
        </form>
      </div>
    );
  };

  //입력 후 결과 화면 출력
  _result = event => {
    event.preventDefault();
    let ddata;

    //입력 form에서 입력 데이터 가져오기
    let formData = new FormData(event.target);
    ddata = this.state.bookData;

    //입력화면에 있는 장, 시작 절, 끝 절 값 가져오기
    let cnum = Number(formData.get("chapterNum"));
    let vsnum = Number(formData.get("verseStart"));
    let venum = Number(formData.get("verseEnd"));

    //절을 입력하지 않았을 시 장 전체 출력
    if (
      Number(formData.get("verseStart")) === 0 &&
      Number(formData.get("verseEnd")) === 0
    ) {
      vsnum = 1;
      document.getElementById("verseStart").value = 1;
      venum = 999;
    }
    //시작 절 부분만 입력시 해당 구절만 출력
    else if (
      Number(
        formData.get("verseStart") > 0 && Number(formData.get("verseEnd")) === 0
      )
    ) {
      venum = vsnum;
      document.getElementById("verseEnd").value = vsnum;
    }

    //입력이 올바르지 않을시 alert출력 및 값 재설정
    if (cnum < 0) {
      alert("올바르지 않은 입력입니다.");
      return;
    }

    //입력한 성경이 몇 장으로 이루어져있는지 정보 가져오기
    let maxChapter = Number(ddata.book.length);
    //입력한 장이 해당 성경의 장수보다 높으면 마지막 장을 출력하도록 갱신
    if (cnum > maxChapter) {
      cnum = maxChapter;
      document.getElementById("chapterNum").value = maxChapter;
    }

    //입력한 장이 몇 절로 이루어졌는지 정보 가져오기
    //let maxVerse = Number(Object.keys(ddata.book[cnum-1]).length);
    const obj = Object.values(ddata.book[cnum - 1]);
    const ar = obj[0];
    let maxVerse = Number(Object.keys(ar).length);
    //입력이 올바르지 않을시 alert출력 및 값 재설정
    if (vsnum <= 0 || vsnum > venum) {
      alert("올바르지 않은 입력입니다.");
      return;
    }

    let loaded = [];

    //입력한 절이 해당 장의 절수보다 높으면 마지막 절을 출력하도록 갱신
    if (venum > maxVerse) {
      venum = maxVerse;
      document.getElementById("verseEnd").value = maxVerse;
    }
    if (vsnum > maxVerse) {
      vsnum = maxVerse;
      document.getElementById("verseStart").value = maxVerse;
    }
    let i = vsnum;
    while (i <= venum) {
      var element = document.getElementById(i * 1000);
      if (element !== null) {
        element.style.color = "black";
        element.style.fontWeight = 400;
      }
      loaded.push({ verseNum: i, verse: Object.values(ar)[i - 1] });
      i++;
    }

    //bible.json파일에 있는 data에서 필요한 구절들을 배열에 넣고 state에 갱신
    this.setState({
      chapter: cnum,
      verseS: vsnum,
      verseE: venum,
      verseData: loaded,
      view: true
    });
  };

  //state에 있는 data를 div tag에 리턴
  _words = () => {
    let items = null;
    if (this.state.verseData.length === 1) {
      items = this.state.verseData.map(tempV => {
        var index = Number(tempV.verseNum) * 1000;
        return (
          <p
            key={index}
            id={index}
            style={{ color: "black", fontWeight: 400 }}
            onClick={() => {
              this._selectVerses(index);
            }}
          >
            {tempV.verse}
          </p>
        );
      });
    } else {
      items = this.state.verseData.map(tempV => {
        var index = Number(tempV.verseNum) * 1000;
        return (
          <p
            key={index}
            id={index}
            style={{ color: "black", fontWeight: 400 }}
            onClick={() => {
              this._selectVerses(index);
            }}
          >
            {Number(tempV.verseNum)}. {tempV.verse}
          </p>
        );
      });
    }

    return items;
  };

  //구절 선택시 폰트 변경
  _selectVerses = verseNumber => {
    var selectedVerse = document.getElementById(verseNumber);
    if (selectedVerse.style.color === "black") {
      selectedVerse.style.color = "#003399";
      selectedVerse.style.fontWeight = 500;
    } else {
      selectedVerse.style.color = "black";
      selectedVerse.style.fontWeight = 400;
    }
    this._selectedCopy();
  };

  //선택한 구절 클립보드에 복사
  _selectedCopy = () => {
    var str = "";
    for (
      var i = Number(this.state.verseS);
      i <= Number(this.state.verseE);
      ++i
    ) {
      var element = document.getElementById(i * 1000);
      if (element.style.color !== "black") {
        str = str + String(element.textContent) + "\n";
      }
    }
    str = str + (this.state.bookName + " " + this.state.chapter + "장 KRV");
    var el = document.createElement("textarea");
    el.innerHTML = str;
    el.style.pointerEvents = "none";
    el.style.opacity = 0;
    document.body.appendChild(el);
    window.getSelection().removeAllRanges();
    var range = document.createRange();
    range.selectNode(el);
    window.getSelection().addRange(range);
    document.execCommand("copy");
  };

  //출력된 구절 클립보드에 복사하기
  _copyData = () => {
    let copyText = document.querySelector(".verseDisplay");
    let selection = window.getSelection();
    let range = document.createRange();
    range.selectNodeContents(copyText);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("Copy");
    alert("클립보드에 복사 완료!");
  };

  _prevChapter = () => {
    let chNum = document.getElementById("chapterNum").value;
    if (chNum > 1) {
      document.getElementById("chapterNum").value = Number(chNum) - 1;
      document.getElementById("verseStart").value = null;
      document.getElementById("verseEnd").value = null;
      document.getElementById("viewSubmit").click();
    }
  };

  _nextChapter = () => {
    let chNum = document.getElementById("chapterNum").value;
    document.getElementById("chapterNum").value = Number(chNum) + 1;
    document.getElementById("verseStart").value = null;
    document.getElementById("verseEnd").value = null;
    document.getElementById("viewSubmit").click();
  };

  _clearInput = () => {
    document.getElementById("chapterNum").value = null;
    document.getElementById("verseStart").value = null;
    document.getElementById("verseEnd").value = null;
    for (
      var i = Number(this.state.verseS);
      i <= Number(this.state.verseE);
      ++i
    ) {
      var element = document.getElementById(i * 1000);
      if (element.style.color !== "black") {
        element.style.color = "black";
        element.style.fontWeight = 400;
      }
    }
  };

  render() {
    return (
      <div className="AppDisplay" align="center">
        <button id="ot" onClick={this._loadingOT}>
          구약
        </button>
        <button id="nt" onClick={this._loagingNT}>
          신약
        </button>
        <div className="books">
          {this.state.data.length !== 0 ? this._displayData() : null}
          {this.state.book !== 0 ? this._chapterVerse() : null}
          {this.state.book !== 0 ? (
            <p id="lastinfo" align="left">
              해당 장(절)보다 큰 수 입력시 마지막 장(절) 출력
              <br />
              예) 창세기 경우 50장 이므로 50보다 큰 수 입력시 50장이 입력됨.
              <br />
              원하는 구절 선택시 클립보드에 복사됨.
            </p>
          ) : null}
        </div>
        {this.state.view ? (
          <div>
            <button id="copy" onClick={this._copyData}>
              전체복사
            </button>
            <button id="prev" onClick={this._prevChapter}>
              이전장
            </button>
            <button id="next" onClick={this._nextChapter}>
              다음장
            </button>
            <button id="clear" onClick={this._clearInput}>
              초기화
            </button>
          </div>
        ) : null}
        <br />
        <div className="verseDisplay" align="left">
          {this._words()}
          {this.state.view && this.state.verseS !== this.state.verseE ? (
            <p id="info">
              {this.state.bookName} {this.state.chapter}:{this.state.verseS}
              ~{this.state.verseE} KRV
            </p>
          ) : null}
          {this.state.view && this.state.verseS === this.state.verseE ? (
            <p id="info">
              {this.state.bookName} {this.state.chapter}:{this.state.verseS}{" "}
              KRV
            </p>
          ) : null}
        </div>
      </div>
    );
  }
}

export default App;
