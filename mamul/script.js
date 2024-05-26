const vangi_dict = ["Meethas", "Ice Cream", "Kharas (Veg)", "Kharas (Meat)", "Kharas (Chicken)", "TARKARI VEG", "TARKARI NON VEG", "Bakery", "Main Course", "Main Course", "Salads", "Fruits", "Beverages - Cold"];

// Function to create a select element with options
function createSelectElement(category) {
    const select = document.createElement('select');
    select.id = category.replace(/\s+/g, ''); // Remove spaces to create valid ID
    return select;
}

// Function to add options to a select element
function addOption(selectElement, text, hasRecipe) {
    const option = document.createElement('option');
    option.value = text;
    option.textContent = text + (hasRecipe ? '' : '*'); // Append asterisk if dish doesn't have recipe
    selectElement.appendChild(option);
}

// Function to create and append select elements to the table row
function createSelectOptions() {
    const selectOptionsRow = document.getElementById('selectOptionsRow');
    let row;
    for (let i = 0; i < vangi_dict.length; i++) {
        if (i % 4 === 0) { // Start a new row after every 4 elements
            row = document.createElement('tr');
            selectOptionsRow.appendChild(row);
        }
        const category = vangi_dict[i];
        const select = createSelectElement(category);
        const cell = document.createElement('td');
        cell.appendChild(select);
        row.appendChild(cell);
        // Add category name as the first option
        addOption(select, category, false);
        // Add options for dishes in the category based on the recipes dictionary
        for (const [item, cat] of Object.entries(menuDict)) {
            if (cat === category) {
                const hasRecipe = item in recipes; // Check if dish has recipe
                addOption(select, item, hasRecipe);
            }
        }
    }
}

// Call the function to create select options on page load
window.onload = createSelectOptions;

// Function to calculate ingredients for all selected dishes
function calculateIngredients() {
    const selectedDishes = [];

    // Get all select elements
    const selectElements = document.querySelectorAll('select');
    // Extract selected options
    selectElements.forEach(select => {
        if (select.value !== '#') {
            selectedDishes.push(select.value);
        }
    });

    const thalQuantity = document.getElementById('thalQuantity').value;
    const totalIngredients = {};

    // Loop through selected dishes
    selectedDishes.forEach(dish => {
        const dishIngredients = recipes[dish];

        // Loop through ingredients of the dish
        for (let ingredient in dishIngredients) {
            if (totalIngredients.hasOwnProperty(ingredient)) {
                // If ingredient already exists, add the quantity
                totalIngredients[ingredient].quantity += dishIngredients[ingredient].quantity;
            } else {
                // If ingredient doesn't exist, add it to the total
                totalIngredients[ingredient] = {
                    quantity: dishIngredients[ingredient].quantity,
                    unit: dishIngredients[ingredient].unit
                };
            }
        }
    });

    // Display total ingredients
    const ingredientsRow = document.getElementById('ingredientsRow');
    ingredientsRow.innerHTML = '';

    let row;

    for (let ingredient in totalIngredients) {
        const quantity = totalIngredients[ingredient].quantity * thalQuantity / 8; // Adjust quantity for servings
        const unit = totalIngredients[ingredient].unit;

        // If row is undefined or if it already contains four cells, create a new row
        if (!row || row.childElementCount === 4) {
            row = document.createElement('tr');
            ingredientsRow.appendChild(row);
        }

        // Create a cell for ingredient name
        const itemNameCell = document.createElement('td');
        itemNameCell.textContent = ingredient;

        // Create a cell for ingredient quantity
        const quantityCell = document.createElement('td');
        quantityCell.textContent = `${quantity.toFixed(2)} ${unit}`; // Display quantity with 2 decimal places

        // Append cells to the row
        row.appendChild(itemNameCell);
        row.appendChild(quantityCell);
    }
}

function printTable() {
    const table = document.getElementById('dinnerTable');
    const originalDisplay = [];

    // Hide all body children except the table
    Array.from(document.body.children).forEach((child, index) => {
        if (child !== table) {
            originalDisplay[index] = child.style.display;
            child.style.display = 'none';
        }
    });

    // Print the table
    window.print();

    // Restore original display styles
    Array.from(document.body.children).forEach((child, index) => {
        if (child !== table) {
            child.style.display = originalDisplay[index];
        }
    });
}
