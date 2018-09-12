//BUDGET CONTROLLER
var budgetController = (function(){
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    var Expenses = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    
    Expenses.prototype.calculatePercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round( (this.value / totalIncome) * 100);
        }
        else
            this.percentage = -1;
        

    };
    
    Expenses.prototype.getPercentages = function(){
        return this.percentage;
    };
    
    var data = {
    addItem : {
                 income : [],
                 expense :[]
                },
    total : {
            income : 0,
            expense : 0
            },
    budget : 0,
    percentage : -1
    };
    
    var total = function(type){
        var sum = 0;
        data.addItem[type].forEach(function(current){
           sum += current.value; 
        });
        data.total[type] = sum;
    };
    
    return {
        addBdgtItem : function(type, desc, value){
          var ID, newItem;
            // 1. Create ID
            if(data.addItem[type].length > 0){
                ID = (data.addItem[type][data.addItem[type].length-1]).id + 1;
            }  else {
                ID = 0;
            }
            
            // 2. Create item
             if(type === 'income'){
                newItem = new Income(ID, desc, value);
            } else if(type === 'expense'){
                newItem = new Expenses(ID, desc, value);
            }
            
            //3. Add it to array            
            data.addItem[type].push(newItem);
            
            return newItem;
        },
        
        calcBudget : function(){
            var totalIncome, totalExpenses;
            
            // Calculate Total income and expenses
            total('income');
            total('expense');
            
            // Calculate Budget
            data.budget = data.total.income - data.total.expense;
            
            // Calculate percentage
            if(data.total.income > 0)
                data.percentage = Math.floor((data.total.expense / data.total.income) * 100);
            else
                data.percentage = '---';
        },
        
        deleteItem : function(type, id){
            ids = data.addItem[type].map(function(current){
               return  current.id;
            });
                        
            index = ids.indexOf(id);
                        
            if(index !== -1){
                data.addItem[type].splice(index, 1);
            }
            
        },
        
        calcPercentage : function(){
            data.addItem['expense'].forEach(function(cur){
               cur.calculatePercentage(data.total.income); 
                
            });            
        },
        
        getPercentage : function(){
            var perArr =  data.addItem['expense'].map(function(cur){
                return cur.getPercentages(); 
            });  
            return perArr;
        },
        
        returnBudget : function() {
            return {
                inc : data.total.income,
                exp : data.total.expense,
                budget : data.budget,
                percentage : data.percentage
            }
           
        } 
    }

})();

//UI CONTROLLER
var UIController = (function(){
    
    var DOMString = {
        type : '.add__type',
        desc : '.add__description',
        value : '.add__value',
        btn : '.add__btn',
        incomeContainer : '.income__list',
        expensesContainer : '.expenses__list',
        budgetValue : '.budget__value',
        budgetIncome : '.budget__income--value',
        budgetExpense : '.budget__expenses--value',
        budgetPercentage : '.budget__expenses--percentage',
        container : '.container',
        itemPercentage : '.item__percentage',
        date : '.budget__title--month'
    }
    
    var nodeListForEach = function(list, callback){
        
             for(var i=0; i < list.length ; i++){
                 callback(list[i], i); 
             }   
    };
    
    var numberFormat = function(num, type){
        /*
        
         i/p : 2,345.2345
         i/p : 2345

        */
        var num, numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        
        if(int.length > 3){
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3 , 3);
        }
        
        return (type == 'expense' ? '-' : '+') + ' ' + int + '.' + dec;
        
    }
    
    return {
            getInput : function(){
                return {
                    inputType : document.querySelector(DOMString.type).value,
                    inputDesc : document.querySelector(DOMString.desc).value,
                    inputValue : parseFloat(document.querySelector(DOMString.value).value)
                };
            },
        
            getDOMStrings : function(){
                return DOMString;
            },
        
            addUIItem : function(newItem , type){
                var html, newHtml, element;
                
                // get html
                if(type === "income"){
                    element = DOMString.incomeContainer;
                    html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }
                else if(type === "expense"){
                    element = DOMString.expensesContainer;
                    html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>' ;
                }
                
                //  replace values
                newHtml = html.replace('%id%',newItem.id);
                newHtml = newHtml.replace('%description%',newItem.description);
                newHtml = newHtml.replace('%value%',numberFormat(newItem.value, type));

                // display
                document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
            }, 
        
        deleteUIItem : function(ele){
            var element = document.getElementById(ele);  element.parentNode.removeChild(element);
            
        },    
        
        clearInputFields : function(){
            var fields,fieldsArr;
            
            fields = document.querySelectorAll(DOMString.desc + ',' + DOMString.value);
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current ,index ,array){
                current.value = '';
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(totalBdgt){
           
           var type = totalBdgt.budget > 0 ? 'income' : 'expense';
            document.querySelector(DOMString.budgetValue).textContent = numberFormat(totalBdgt.budget, type);
            document.querySelector(DOMString.budgetIncome).textContent = numberFormat(totalBdgt.inc, 'income');
            document.querySelector(DOMString.budgetExpense).textContent = numberFormat(totalBdgt.exp, 'expense');
            if(totalBdgt.percentage > 0)
                document.querySelector(DOMString.budgetPercentage).textContent = totalBdgt.percentage + '%';
            
            else
                document.querySelector(DOMString.budgetPercentage).textContent = '---';
            
        },
        
        displayPercentages : function(percentages){
           var fields = document.querySelectorAll(DOMString.itemPercentage);
           
               nodeListForEach(fields, function(current , index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }
                else {
                  current.textContent = '---';  
                }
                
            }); 
                                    
        },
        
        date : function(){
            var now, month, year, months;
            months = [ 'January', 'February' , 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMString.date).textContent = months[month] + ' ' + year;
            
        },
        
        changeType: function(){
            var fields = document.querySelectorAll(DOMString.type + ',' + DOMString.desc + ',' + DOMString.value);
            
            nodeListForEach(fields, function(current){
               current.classList.toggle('red-focus');
            })
            
            document.querySelector(DOMString.btn).classList.toggle('red');
        }
        
    };

    

})();

//APP CONTROLLER
var controller = (function(bdgtCtrl, UICtrl){
    
    var DOM = UICtrl.getDOMStrings();
    
    //Add event listeners
    var eventListeners = function(){
        document.querySelector(DOM.btn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress',function(e){
            if(e.keyCode === 13){
                ctrlAddItem();
            }
        } );
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.type).addEventListener('change', UICtrl.changeType);
    }
    
    var budgetCalc = function(){
        // Calculate budget
        bdgtCtrl.calcBudget();
        
        // Return budget
        var totalBudget = bdgtCtrl.returnBudget();
        
        // Display budget
        UICtrl.displayBudget(totalBudget);
    };
    
    var updatePercentage = function(){
        
        // Calculate percentage
        bdgtCtrl.calcPercentage();
        
        // Return Percentage
        var percentages = bdgtCtrl.getPercentage();
        
        
        // Display percentage
        UICtrl.displayPercentages(percentages);
    };
    
    var ctrlAddItem = function (){
        //1. Get the input fields
        var input = UICtrl.getInput();
       
        if(input.inputDesc !== "" && input.inputValue !== NaN && input.inputValue > 0){

            //2. Add the item to the budgetCOntroller
            var newItem = bdgtCtrl.addBdgtItem(input.inputType, input.inputDesc, input.inputValue);
            
            //3. Add the item to the UI
            UICtrl.addUIItem(newItem, input.inputType);

            //4. Clear input fields
            UICtrl.clearInputFields();

            //5. Calculate budget
            budgetCalc();

            //6. Display
            updatePercentage();
        }
    };
    
    var ctrlDeleteItem = function(event) {
        var itemType, itemSplit, type, id;
        
       itemType = event.target.parentNode.parentNode.parentNode.parentNode.id;
        itemSplit = itemType.split('-');
        type = itemSplit[0];
        id = parseInt(itemSplit[1]);
        
        // Remove from budgetController
        bdgtCtrl.deleteItem(type, id);
        
        // Remove from UI
        UICtrl.deleteUIItem(itemType);
        
        // Update the Budget
        budgetCalc();
        
        updatePercentage();
    };
        
    
   
    
    return {
      init : function(){
                console.log("Application Starts");
                eventListeners(); 
                 UICtrl.displayBudget({
                    inc : 0,
                    exp : 0,
                    budget : 0,
                    percentage : -1
                 });
                UICtrl.date();
            }  
    };
    
})(budgetController, UIController);

controller.init();
