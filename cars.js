const SERVER_URL = "http://localhost:8080/api/";
import { paginator } from "../../paginator/paginate-bootstrap.js";
import { sanitizeStringWithTableRows } from "./utils.js";

const SIZE = 10;
let cars = [];

let sortField = "brand";
let sortOrder = "desc";

let initialized = false;

function handleSort(pageNo) {
  sortOrder = sortOrder == "asc" ? "desc" : "asc";
  sortField = "brand";
  load(pageNo);
}

// Fetches amount of cars from the backend. Used to calculate the total amount of pages for the paginator.
async function fetchCarsTotal(){

  try{
    const response = await fetch(SERVER_URL + 'countcars');
    const total = await response.json();
    console.log(total)
    return total;
  }catch(e){
    console.error(e);
  }
}

async function load(pageNo) {
  // We don't want to set up a new handler each time load fires
  if (!initialized) {
    document.getElementById("header-brand").onclick = function (evt) {
      evt.preventDefault();
      handleSort(pageNo);
    };
    initialized = true;
  }

  pageNo = Number(pageNo);

  let queryString = `?sort=${sortField},${sortOrder}&size=${SIZE}&page=` + (pageNo - 1);
  try {
    cars = await fetch(`${SERVER_URL}cars${queryString}`).then((res) => res.json());
  } catch (e) {
    console.error(e);
  }
  const rows = cars
    .map(
      (car) => `
  <tr>
    <td>${car.id}</td>
    <td>${car.brand}</td>
    <td>${car.model}</td>
    <td>${car.color}</td>
    <td>${car.kilometers}</td>
  `
    )
    .join("");

  // DON'T forget to sanitize the string before inserting it into the DOM
  document.getElementById("tbody").innerHTML = sanitizeStringWithTableRows(rows);

  const totalcars = await fetchCarsTotal();
  const TOTAL = Math.ceil(totalcars / SIZE);

  // (C1-2) REDRAW PAGINATION
  paginator({
    target: document.getElementById("car-paginator"),
    total: TOTAL,
    current: pageNo,
    click: load,
  });
}


// Load the first page initially
load(1);
