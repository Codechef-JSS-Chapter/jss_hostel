displayClickedTab(1);
const basicTab = $('#panelSelectBtn div:nth-child(1)');
const funTab = $('#panelSelectBtn div:nth-child(2)');
basicTab.click(()=>{
	displayClickedTab(1);
});
funTab.click(()=>{
	displayClickedTab(2);
});
function displayClickedTab(tabNumber){
	for(i=1;i<3;i++)
	{
		if(i==tabNumber){
			$(`#panelSelectBtn div:nth-child(${i})`).css('background-color','#E0E5EC');
			$(`#panelSelect>div:nth-child(${i+1})`).css('display','grid');
		}
		else{
			$(`#panelSelectBtn div:nth-child(${i})`).css('background-color','#F4F6F6');
			$(`#panelSelect>div:nth-child(${i+1})`).css('display','none');
		}
	}
}

$(`#mobileBar`).hide();
function openhammenue(x){
	$(`#mobileBar`).slideToggle();
	x.classList.toggle("fa-times");
}