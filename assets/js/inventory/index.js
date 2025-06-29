import api from '../axiosinterceptor.js'

//전체 데이터 캐시 저장
let response;


//[INV_008] 재고 전체 데이터 받아오기
const inventory_data = async () => {
  let request_data = {
    user_id: 12345
  };

  const inventory_tbody = document.getElementById("inventory_tbody");
  response = await api.get('/inventory.json', request_data);
  console.log(response);
  for (let i = 0; i < response.data.result.inventory.length; i++) {
    const id = response.data.result.inventory[i].id;
    const crop_type = response.data.result.inventory[i].crop_type;
    const crop_state = response.data.result.inventory[i].crop_state;
    const order_count = response.data.result.inventory[i].order_count;
    const inventory_count = response.data.result.inventory[i].inventory_count;
    const max_inventory_count = response.data.result.inventory[i].max_inventory_count;
    const date = response.data.result.inventory[i].date;

    let stateClass = "";
    if (crop_state === "양호") {
      stateClass = "bg-gradient-secondary-green";
    } else if (crop_state === "보통") {
      stateClass = "bg-gradient-secondary-yellow";
    } else if (crop_state === "불량") {
      stateClass = "bg-gradient-secondary-red";
    }

    let trTag = document.createElement("tr");
    trTag.innerHTML = `
                    <td>
                        <div class="d-flex px-2 py-1">
                          <div class="d-flex flex-column justify-content-center">
                            <p class="text-xs font-weight-bold mb-0">${id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p class="text-xs font-weight-bold mb-0">${crop_type}</p>
                      </td>
                      <td class="text-sm">
                        <span class="badge badge-sm ${stateClass}">${crop_state}</span>
                      </td>
                      <td>
                        <p class="text-xs font-weight-bold mb-0">${order_count} /㎡</p>
                      </td>
                      <td class="align-middle text-center text-xs font-weight-bold">
                        <span>${inventory_count} /㎡</span>
                      </td>
                      <td class="align-middle text-center text-xs font-weight-bold">
                        <span>${max_inventory_count} /㎡</span>
                      </td>
                      <td class="align-middle text-center text-xs font-weight-bold text-secondary">
                        <span>${date}</span>
                      </td>
                      <td class="align-middle">
                        <a href="javascript:;" class="edit_btn text-secondary font-weight-bold text-xs" data-toggle="tooltip"
                          data-original-title="Edit user" data-bs-toggle="modal" data-bs-target="#exampleModal">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                            class="bi bi-pencil-square" viewBox="0 0 16 16">
                            <path
                              d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                            <path fill-rule="evenodd"
                              d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                          </svg>
                        </a>
                      </td>
                      `;
    inventory_tbody.appendChild(trTag);
  }

  //편집 버튼 눌렀을 때 작동하도록 이벤트 리스너
  inventory_tbody.addEventListener("click", (e) => {
    const edit_btn = e.target.closest(".edit_btn");
    if (edit_btn) {
      inventory_data_edit(e);
    }
  });
}

//재고 편집 버튼 눌렀을 때 - 상세 모달 창 띄우도록
//데이터를 db에서 다시 가져오는 건 아니고 페이지에 그렸던 데이터를 가져옴
const inventory_data_edit = (e) => {
  console.log("inventory_data_edit 실행됨!");
  const trTag = e.target.closest("tr"); // 클릭된 요소 기준으로 가장 가까운 <tr> 요소 찾기
  const tdList = trTag.getElementsByTagName("td"); //<td>들을 모두 가져오기

  //각 칼럼 데이터 추출
  const id = tdList[0].innerText.trim();
  const crop_type = tdList[1].innerText.trim();
  const crop_state = tdList[2].innerText.trim();
  const order_count = tdList[3].innerText.trim();
  const inventory_count = tdList[4].innerText.trim();
  const max_inventory_count = tdList[5].innerText.trim();
  const date = tdList[6].innerText.trim();
  console.log("id=", id, "  type=", crop_type, " state=", crop_state, " order_counst=", order_count, " inventory_count=", inventory_count, " max_count=", max_inventory_count, date);


  const modal_inventory_id = document.getElementById("modal_inventory_id");
  const modal_inventory_crop_type = document.getElementById("modal_inventory_crop_type");
  const modal_inventory_count = document.getElementById("modal_inventory_count");
  const modal_date = document.getElementById("date");

  modal_inventory_id.value = id;
  modal_inventory_crop_type.value = crop_type;
  modal_inventory_count.value = inventory_count.split(" ")[0];
  modal_date.value = date;

  let save_btn = document.getElementById("save_btn");
  save_btn.addEventListener("click", () => {
    inventory_modify(e);
  });
}


//[INV_003, INV004] 예측 수확량, 생산일 수정 응답 데이터
//받아온 데이터는 처음 페이지 생성할 때 받은 응답에서 수정할 수 있도록
const inventory_modify = async (e) => {
  const modal_inventory_id = document.getElementById("modal_inventory_id");
  const modal_inventory_count_input = document.getElementById("modal_inventory_count");
  const modal_date_input = document.getElementById("date");

  let request_data = {
    id: modal_inventory_id.value,
    count: modal_inventory_count_input.value,
    date: modal_date_input.value
  };

  let response_data = await api.post('/inventory_modify.json', request_data);
  console.log("modify_reponse_data = ", response_data, "\nevent = ", e);

  if (response_data.data.success) {
    const trTag = e.target.closest("tr");
    const tdList = trTag.getElementsByTagName("td");

    let inventory_count = tdList[4];
    let date = tdList[6];

    inventory_count.textContent = `${response_data.data.result.inventory.inventory_count} /㎡`;
    date.textContent = response_data.data.result.inventory.date;
    console.log(inventory_count.value, ", ", date.value);


    //모달창 숨기기
    const modalElement = document.getElementById('exampleModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
  }
}


//재고 검색했을 때 응답 데이터
const inventory_search = async () => {

}



export { inventory_data, inventory_search }