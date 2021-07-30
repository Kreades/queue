
/* ============================================== */
/* JS исключительно ДЛЯ ПРИМЕРА работы интерфейса */
/* ============================================== */

$(function() {

	/* Таймер на рабочем месте */

	const seatTimer = {
		timer: $('#seatTimer').timer({ format: '%H:%M:%S' }),
		toggleButtonClass: 'js-seat-timer-toggle',
		toggleClass: 'seatBlock__switch--stop',
		textStart: 'Начать',
		textStop: 'Перерыв'
	};

	$(`.${seatTimer.toggleButtonClass}`).on('click', function(e) {

		e.preventDefault();

		if (seatTimer.timer.data('state') == 'running') {
			seatTimer.timer.timer('pause');
			$(this).removeClass(seatTimer.toggleClass).text(seatTimer.textStart);
		} else {
			seatTimer.timer.timer('resume');
			console.log('resume');
			$(this).addClass(seatTimer.toggleClass).text(seatTimer.textStop);
		}
	});

	/* Процесс обслуживания */

	const queueList = {

		callButtonClass: 'js-call-client',

		itemClass: 'queueList__item',
		itemInactiveClass: 'queueList__item--inActive',
		itemCompleteClass: 'queueList__item--complete',
		itemActionClass: 'queueList__action',
		
		waitTemplate:
			`<div class="queueList__time">
				<span class="queueList__clock">00:00</span>
				<a href="#" class="queueList__waitCancel js-complete"><svg class="icon"><use xlink:href="images/icons-sprite.svg#icon-delete-small"></use></svg>Не подошел?</a>
			</div>
			<a href="#" class="button button--green js-start-service"><svg class="icon button__icon"><use xlink:href="images/icons-sprite.svg#icon-ok"></use></svg>Киент подошел</a>`,
		waitTimerClass: 'queueList__clock',
		waitTimerAlarmClass: 'queueList__clock--alarm',
		waitTime: '60s',
		
		completeButtonClass: 'js-complete',
		completeTemplate:
			`<div class="queueList__time">
				<span class="queueList__clock">15 мин.</span><span>22.07.2021 – 17:34</span>
			</div>
			<div class="accountLink queueList__account">
				<img src="./images/avatar.jpg" class="accountLink__avatar" alt="">
				<span class="accountLink__name">Manager</span>
			</div>`,
		completeListClass: 'js-queue-complete-list',
		
		startButtonClass: 'js-start-service',
		startModalClass: 'serviceModal',
		startPanelClass: 'serviceModal__panel',
		startTimerClass: 'serviceModal__clock',

		queueCounterClass: 'js-queue-counter',
		queueCompleteCounterClass: 'js-queue-complete-counter',

		noQueueTemplate: `<div class="queueList__message">Ожидаем новых клиентов...</div>`,

		currentId: null

	};

	function queueListDeactivateOther(clientId) {

		clientId.siblings(`.${queueList.itemClass}`).addClass(queueList.itemInactiveClass);

	}

	function queueListWaitState(clientId) {

		let el = clientId.find(`.${queueList.itemActionClass}`);

		gsap.to(el.children(), { opacity: 0, duration: 0.25, onComplete: () => {
			el.empty();
			let newEl = el.append(queueList.waitTemplate);
			gsap.from(newEl, { opacity: 0, duration: 0.25 });
			queueListWaitTimer($(`#${queueList.currentId}`)); // включаем таймер ожидания
		} });

	}

	function queueListWaitTimer(clientId) {

		const timer = clientId.find(`.${queueList.waitTimerClass}`);

		timer.timer({
			format: '%M:%S',
			duration: queueList.waitTime,
			countdown: true,
			callback: function() {
        		timer.addClass(queueList.waitTimerAlarmClass);
    		}
		});
	}

	function queueListComplete(clientId, animDelay = 0) {
		
		// счетчики обслужено / в очереди
		let queueCounter = +$(`.${queueList.queueCounterClass}`).text();
			queueCounter--;
		$(`.${queueList.queueCounterClass}`).text(queueCounter);

		let queueCompleteCounter = +$(`.${queueList.queueCompleteCounterClass}`).text();
			queueCompleteCounter++;
		$(`.${queueList.queueCompleteCounterClass}`).text(queueCompleteCounter);

		// сообщение если очередь пуста
		if (queueCounter == 0) clientId.parent().append(queueList.noQueueTemplate);

		// заверешение клиента
		gsap.to(clientId, { yPercent: 200, duration: 0.35, ease: Back.easeIn, delay: animDelay, clearProps: 'transform', onComplete: () => {
			clientId.addClass(queueList.itemCompleteClass);
			clientId.find(`.${queueList.itemActionClass}`).empty().append(queueList.completeTemplate);
			clientId.detach().prependTo(`.${queueList.completeListClass}`);
			$(`.${queueList.itemInactiveClass}`).removeClass(queueList.itemInactiveClass);	
		} });
		queueList.currentId = null; // обнулить ID.
		
	}

	$(`.${queueList.callButtonClass}`).on('click', function(e) {

		e.preventDefault();

		queueList.currentId = $(this).closest(`.${queueList.itemClass}`).attr('id');

		queueListDeactivateOther($(`#${queueList.currentId}`)); // заблокировать остальные
		queueListWaitState($(`#${queueList.currentId}`)); // меняем состояние на ожидание

	});

	$(document).on('click', `.${queueList.completeButtonClass}`, function(e) {

		e.preventDefault();

		if ($(`.${queueList.startModalClass}`).is(':visible')) {
			$(`.${queueList.startTimerClass}`).timer('remove');
			gsap.to($(`.${queueList.startPanelClass}`), { yPercent: 100, duration: 0.5, ease: Back.easeInOut });
			gsap.to($(`.${queueList.startModalClass}`), { opacity: 0, duration: 0.5, delay: 0.3, clearProps: 'all', onComplete: () => {
				scrollLock.enablePageScroll();
			} });
			gsap.set($(`.${queueList.startPanelClass}`), { clearProps: 'all', delay: 0.8 });
			queueListComplete($(`#${queueList.currentId}`), 0.5); // завершить текущий с задержкой
			
		} else {
			queueListComplete($(`#${queueList.currentId}`)); // завершить текущий сразу
		}
		

	});

	$(document).on('click', `.${queueList.startButtonClass}`, function(e) {

		e.preventDefault();

		$(`.${queueList.startModalClass}`).show();
		scrollLock.disablePageScroll();
		gsap.from($(`.${queueList.startModalClass}`), { opacity: 0, duration: 0.5, clearProps: 'opacity' });
		gsap.from($(`.${queueList.startPanelClass}`), { yPercent: 100, duration: 0.5, ease: Back.easeInOut });
		$(`.${queueList.startTimerClass}`).timer({ format: '%M:%S' });

	});

});