
	mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        center:list.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 8 // starting zoom
    });


    const popup = new mapboxgl.Popup({ offset: 2 })
                    .setHTML(`<h3>${list.title}</h3><p>exact location provided after booking</p>`)
                    .setMaxWidth("300px");

  const marker= new mapboxgl.Marker({color:"red"})
        .setLngLat(list.geometry.coordinates)
        .setPopup(popup) 
        .addTo(map);



