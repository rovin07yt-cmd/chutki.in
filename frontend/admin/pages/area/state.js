export const areaState = {
  areas: [],
  selectedAreaId: null,

  map: null,

  circleLayers: new Map(),

  selectedCircle: null,

  editingCircle: false,
  addingCircle: false,

  centerMarker: null,
  radiusHandle: null,
  draftCircle: null
};

export function resetCircleState() {
  areaState.selectedCircle = null;
  areaState.editingCircle = false;
  areaState.addingCircle = false;
  areaState.centerMarker = null;
  areaState.radiusHandle = null;
  areaState.draftCircle = null;
}
