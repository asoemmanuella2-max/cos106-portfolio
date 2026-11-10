const taskForm = document.querySelector("#task-form");

if (taskForm) {
  const taskInput = document.querySelector("#task-input");
  const taskList = document.querySelector("#task-list");
  const plannerMessage = document.querySelector("#planner-message");
  const totalCount = document.querySelector("#total-count");
  const completedCount = document.querySelector("#completed-count");
  const pendingCount = document.querySelector("#pending-count");

  const tasks = [];

  function updateTaskCounts() {
    const completedTasks = tasks.filter((task) => task.completed).length;

    totalCount.textContent = tasks.length;
    completedCount.textContent = completedTasks;
    pendingCount.textContent = tasks.length - completedTasks;
  }

  function renderTasks() {
    taskList.replaceChildren();

    tasks.forEach((task) => {
      const listItem = document.createElement("li");
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      const taskText = document.createElement("span");
      const deleteButton = document.createElement("button");

      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.setAttribute("aria-label", `Mark ${task.text} as complete`);

      taskText.textContent = task.text;
      if (task.completed) {
        taskText.classList.add("completed-task");
      }

      checkbox.addEventListener("change", () => {
        task.completed = checkbox.checked;
        renderTasks();
      });

      label.append(checkbox, document.createTextNode(" "), taskText);

      deleteButton.type = "button";
      deleteButton.textContent = "Delete";
      deleteButton.setAttribute("aria-label", `Delete task: ${task.text}`);

      deleteButton.addEventListener("click", () => {
        const taskIndex = tasks.findIndex((item) => item.id === task.id);
        if (taskIndex !== -1) {
          tasks.splice(taskIndex, 1);
        }
        renderTasks();
      });

      listItem.append(label, deleteButton);
      taskList.append(listItem);
    });

    updateTaskCounts();
  }

  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const taskName = taskInput.value.trim();

    if (taskName === "") {
      plannerMessage.textContent = "Please enter a task.";
      taskInput.focus();
      return;
    }

    tasks.push({
      id: Date.now() + Math.random(),
      text: taskName,
      completed: false
    });

    taskInput.value = "";
    plannerMessage.textContent = "Task added.";
    renderTasks();
    taskInput.focus();
  });
}

const contactForm = document.querySelector("#contact-form");

if (contactForm) {
  const nameInput = document.querySelector("#contact-name");
  const emailInput = document.querySelector("#contact-email");
  const phoneInput = document.querySelector("#contact-phone");
  const messageInput = document.querySelector("#contact-message-text");
  const formMessage = document.querySelector("#form-message");

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !email || !phone || !message) {
      formMessage.textContent = "Please complete every field.";
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      formMessage.textContent = "Please enter a valid email address.";
      emailInput.focus();
      return;
    }

    const phonePattern = /^\d+$/;
    if (!phonePattern.test(phone)) {
      formMessage.textContent = "Use digits only in the phone number.";
      phoneInput.focus();
      return;
    }

    formMessage.textContent =
      `Thank you, ${name}. Your form passed validation.`;
    contactForm.reset();
  });
}