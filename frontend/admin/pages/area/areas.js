import { areaState } from "./state.js";
import {
  getAreas,
  getArea,
  createArea,
  updateArea,
  deleteArea
} from "./api.js";

let callbacks = {
  onAreaSelected: null,
  onAreasChanged: null
};

export function initAreas(options = {}) {
  callbacks = {
    ...callbacks,
    ...options
  };

  bindAreaActions();
}

function bindAreaActions() {
  document
    .getElementById("createAreaBtn")
    ?.addEventListener(
      "click",
      showCreateArea
    );
}

export async function loadAreas(
  selectId = null
) {
  const response = await getAreas();

  if (!response?.success) {
    showAreaError(
      response?.message ||
      "Unable to load areas"
    );

    return false;
  }

  areaState.areas =
    response.data || [];

  renderAreaList();

  if (!areaState.areas.length) {
    areaState.selectedAreaId = null;

    notifyAreaSelection(null);

    return true;
  }

  const targetId =
    selectId ??
    areaState.selectedAreaId ??
    Number(areaState.areas[0].id);

  const exists =
    areaState.areas.some(
      area =>
        Number(area.id) ===
        Number(targetId)
    );

  if (exists) {
    await selectArea(targetId);
  }

  return true;
}

function renderAreaList() {
  const container =
    document.getElementById(
      "areaList"
    );

  if (!container) return;

  if (!areaState.areas.length) {
    container.innerHTML = `
      <div class="area-empty">
        No serviceable areas found.
      </div>
    `;

    updateAreaCount();

    return;
  }

  container.innerHTML =
    areaState.areas
      .map(area => {
        const active =
          Number(area.id) ===
          Number(
            areaState.selectedAreaId
          );

        return `
          <div
            class="area-row ${
              active ? "active" : ""
            }"
            data-area-id="${area.id}"
          >

            <button
              class="area-name-btn"
              data-action="select"
              data-area-id="${area.id}"
            >
              <span class="area-number">
                ${areaState.areas.indexOf(area) + 1}.
              </span>

              <span class="area-name">
                ${escapeHtml(area.name)}
              </span>

              <span class="area-circle-count">
                ${Number(
                  area.total_circles || 0
                )} circles
              </span>
            </button>

            <div class="area-row-actions">

              <button
                class="area-small-btn edit"
                data-action="edit"
                data-area-id="${area.id}"
              >
                EDIT
              </button>

              <button
                class="area-small-btn delete"
                data-action="delete"
                data-area-id="${area.id}"
              >
                DELETE
              </button>

            </div>

          </div>
        `;
      })
      .join("");

  container
    .querySelectorAll(
      "[data-action='select']"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          selectArea(
            Number(
              button.dataset.areaId
            )
          );
        }
      );
    });

  container
    .querySelectorAll(
      "[data-action='edit']"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        event => {
          event.stopPropagation();

          editArea(
            Number(
              button.dataset.areaId
            )
          );
        }
      );
    });

  container
    .querySelectorAll(
      "[data-action='delete']"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        event => {
          event.stopPropagation();

          removeArea(
            Number(
              button.dataset.areaId
            )
          );
        }
      );
    });

  updateAreaCount();
}

async function selectArea(id) {
  const response =
    await getArea(id);

  if (!response?.success) {
    alert(
      response?.message ||
      "Unable to load area"
    );

    return;
  }

  areaState.selectedAreaId =
    Number(id);

  renderAreaList();

  notifyAreaSelection(
    response.data
  );
}

function notifyAreaSelection(area) {
  if (
    typeof callbacks.onAreaSelected ===
    "function"
  ) {
    callbacks.onAreaSelected(area);
  }
}

function updateAreaCount() {
  const element =
    document.getElementById(
      "areaCount"
    );

  if (element) {
    element.textContent =
      areaState.areas.length;
  }
}

function showCreateArea() {
  showAreaModal(
    "Add Serviceable Area",
    "",
    "CREATE",
    async name => {
      const response =
        await createArea(name);

      if (!response?.success) {
        throw new Error(
          response?.message ||
          "Unable to create area"
        );
      }

      await loadAreas(
        response.data?.id
      );

      if (
        typeof callbacks.onAreasChanged ===
        "function"
      ) {
        await callbacks.onAreasChanged();
      }
    }
  );
}

async function editArea(id) {
  const area =
    areaState.areas.find(
      item =>
        Number(item.id) ===
        Number(id)
    );

  if (!area) return;

  await selectArea(id);

  showAreaModal(
    "Edit Serviceable Area",
    area.name,
    "SAVE",
    async name => {
      const response =
        await updateArea(
          id,
          name
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
          "Unable to update area"
        );
      }

      await loadAreas(id);

      if (
        typeof callbacks.onAreasChanged ===
        "function"
      ) {
        await callbacks.onAreasChanged();
      }
    }
  );
}

async function removeArea(id) {
  const area =
    areaState.areas.find(
      item =>
        Number(item.id) ===
        Number(id)
    );

  if (!area) return;

  if (
    !confirm(
      `Delete "${area.name}"?\n\nAll circles belonging to this area will also be deleted.`
    )
  ) {
    return;
  }

  const response =
    await deleteArea(id);

  if (!response?.success) {
    alert(
      response?.message ||
      "Unable to delete area"
    );

    return;
  }

  if (
    Number(areaState.selectedAreaId) ===
    Number(id)
  ) {
    areaState.selectedAreaId = null;
  }

  await loadAreas();

  if (
    typeof callbacks.onAreasChanged ===
    "function"
  ) {
    await callbacks.onAreasChanged();
  }
}

function showAreaModal(
  title,
  initialName,
  buttonText,
  action
) {
  document
    .getElementById("areaModal")
    ?.remove();

  const modal =
    document.createElement("div");

  modal.id = "areaModal";
  modal.className =
    "area-modal-overlay";

  modal.innerHTML = `
    <div class="area-modal">

      <div class="area-modal-header">

        <h2>
          ${escapeHtml(title)}
        </h2>

        <button
          class="icon-btn"
          id="closeAreaModal"
        >
          ×
        </button>

      </div>

      <label>
        Area Name
      </label>

      <input
        id="areaNameInput"
        type="text"
        maxlength="100"
        value="${escapeAttribute(
          initialName
        )}"
        placeholder="e.g. Thakurdwara"
        autocomplete="off"
      >

      <div class="area-modal-actions">

        <button
          class="area-btn"
          id="cancelAreaModal"
        >
          CANCEL
        </button>

        <button
          class="area-btn primary"
          id="saveAreaModal"
        >
          ${buttonText}
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(
    modal
  );

  const close = () =>
    modal.remove();

  document
    .getElementById(
      "closeAreaModal"
    )
    ?.addEventListener(
      "click",
      close
    );

  document
    .getElementById(
      "cancelAreaModal"
    )
    ?.addEventListener(
      "click",
      close
    );

  document
    .getElementById(
      "saveAreaModal"
    )
    ?.addEventListener(
      "click",
      async () => {
        const input =
          document.getElementById(
            "areaNameInput"
          );

        const name =
          input?.value.trim();

        if (!name) {
          alert(
            "Area name is required."
          );

          return;
        }

        const button =
          document.getElementById(
            "saveAreaModal"
          );

        try {
          button.disabled = true;

          await action(name);

          close();

        } catch (error) {
          alert(
            error.message ||
            "Operation failed."
          );

          button.disabled = false;
        }
      }
    );
}

function showAreaError(message) {
  const container =
    document.getElementById(
      "areaList"
    );

  if (!container) return;

  container.innerHTML = `
    <div class="area-error">
      ${escapeHtml(message)}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
