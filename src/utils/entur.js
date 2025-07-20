const header = {
    'Content-Type': 'application/json',
    'ET-Client-Name': 'polar_tracks-discord-bot'
}

const searchStation = async function (responseText) {
    let text = responseText.trim();

    if (text.length == 0) {
        text = 'A';
    }

    const url = `https://api.entur.io/geocoder/v1/autocomplete?text=${encodeURIComponent(text)}&lang=en&layers=venue&categories=railStation&size=25`;

    const searchResponse = await fetch(url, { method: 'GET', headers: header });

    if (!searchResponse.ok) {
        console.error(`Error fetching search results: ${searchResponse.statusText}`);
        return null;
    }

    const json = await searchResponse.json();
    return json.features || [];
}

const getStationData = async function (id, getChild = true, childToGet = 'RAIL_STATION') {
    const url = `https://api.entur.io/stop-places/v1/read/stop-places/${encodeURIComponent(id)}`;
    const mainResponse = await fetch(url, { method: 'GET', headers: header });

    if (!mainResponse.ok) {
        console.error(`Error fetching station data: ${mainResponse.statusText}`);
        return null;
    }

    const mainJson = await mainResponse.json();

    if (!mainJson || Object.keys(mainJson).length === 0) {
        console.error('No root data found in the response');
        return null;
    }

    const keyValues = mainJson.keyList?.keyValue;

    if (!keyValues) {
        console.warn('No keyList found in the root data');
        return mainJson;
    }

    if (!getChild) {
        return mainJson;
    }

    let isParent = false;

    if (Array.isArray(keyValues)) {
        isParent = keyValues.some(key => key.key === 'IS_PARENT_STOP_PLACE' && key.value === 'true');
    } else {
        console.warn('keyValue is not an array, aborting');
        return mainJson;
    }

    if (!isParent) {
        return mainJson;
    }

    const childrenResponse = await fetch(url + '/children', { method: 'GET', headers: header });

    if (!childrenResponse.ok) {
        console.error(`Error fetching children data: ${childrenResponse.statusText}`);
        return mainJson;
    }

    const childrenJson = await childrenResponse.json();

    if (!childrenJson || Object.keys(childrenJson).length === 0) {
        console.error('No children data found in the response');
        return mainJson;
    }

    for (const child of childrenJson) {
        if (child.stopPlaceType === childToGet) {
            return child;
        }
    }

    console.warn(`No child of type ${childToGet} found`);
    return mainJson;
}

module.exports = {
    searchStation,
    getStationData
};
