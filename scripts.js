// Source URL for interactions
const medicationUrl = "https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui=";

// Check medications and reduce to current
document.querySelector("#medCount").innerText = medications.length;
let activeMedications = medications.filter(f => {
    return f.STOP == "";
});

// Check activeMedications and reduce to single instances of medications
document.querySelector("#activeMedCount").innerText = activeMedications.length;
let singleMedications = [];
activeMedications.forEach(f => {
    if(!singleMedications.filter(codeFilter => {return f.CODE == codeFilter.CODE}).length){
        singleMedications.push(f)
    }
    document.querySelector("#singleMedCount").innerText = singleMedications.length;
});

// Check singleMedications and query API
document.querySelector("#queryMedCount").innerText = `0/${singleMedications.length}`;
let medicationData = [];
let patientsWithInteractions = [];
let patientsWithActiveInteractions = [];
singleMedications.forEach(async (med) => {
    // Check if medication has interactions
    let interaction = await GetDataQuery(`${medicationUrl}${med.CODE}`); 
    if(interaction.hasOwnProperty("interactionTypeGroup")){
        activeMedications
            .filter(activeMed => {return activeMed.CODE == med.CODE}) 
            .forEach(medRecord => {
                if(!patientsWithInteractions.includes(medRecord.PATIENT)){
                    patientsWithInteractions.push(medRecord.PATIENT);
                }            
                document.querySelector("#patientInteractionCount").innerText = patientsWithInteractions.length;
            })

            // Check the active medicines if there is an instance of drug interaction
            interaction.interactionTypeGroup.forEach(intTypeGroup => {
                intTypeGroup.interactionType.forEach(intType => {
                    intType.interactionPair.forEach(intPair => {
                        var interactingMed = intPair.interactionConcept[1].minConceptItem.rxcui;
                        var interactingActiveMeds = activeMedications.filter(activeMedFilter => {return activeMedFilter.CODE == interactingMed})
                        if(interactingActiveMeds.length){
                            if(!patientsWithActiveInteractions.includes(medRecord.PATIENT)){
                                patientsWithActiveInteractions.push(medRecord.PATIENT);
                            }  
                        }
                        document.querySelector("#patientActiveInteractionCount").innerText = patientsWithActiveInteractions.length;
                    });
                });
            });
    }
});


// Get the data from the API
async function GetDataQuery(query){
    return await axios.get(query)
    .then((response) => {
        medicationData.push(response.data);        
        document.querySelector("#queryMedCount").innerText = `${medicationData.length}/${singleMedications.length}`;
        return response.data;
    });
}

