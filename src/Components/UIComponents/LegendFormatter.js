export const LegendFormatter = (value, previousLegendName, newLegendName) => {
    if (value === previousLegendName){
        return newLegendName;
    }
    
    return value; 
}
