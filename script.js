const RENDER_BOOKS = 'render-books';
const BOOKS_KEY = 'books-key';

function makeBook(bookObj) {
    const { id, title, author, year, isCompleted } = bookObj;

    const bookCard = document.createElement('div');
    bookCard.classList.add('card-book');

    const bookTitle = document.createElement('h4');
    bookTitle.innerText = title;
    bookCard.append(bookTitle);

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = author;
    bookCard.append(bookAuthor);
    
    const bookYear = document.createElement('p');
    bookYear.innerText = year;
    bookCard.append(bookYear);

    const actionButtonGroup = document.createElement('div');
    actionButtonGroup.classList.add('button-group');

    const btnReadUnread = document.createElement('button');
    btnReadUnread.classList.add('btn-read-unread');

    if (!isCompleted) {
        btnReadUnread.innerText = 'Finish Reading';
        btnReadUnread.addEventListener('click', function() {
            markBookAsRead(id);
        });
    } else {
        btnReadUnread.innerText = 'Unfinished Reading';
        btnReadUnread.addEventListener('click', function() {
            undoReadedBook(id);
        });
    }

    actionButtonGroup.append(btnReadUnread);

    const btnRemoveBook = document.createElement('button');
    btnRemoveBook.classList.add('btn-remove-book');
    btnRemoveBook.innerText = 'Remove Buku';
    btnRemoveBook.addEventListener('click', function() {
        removeBook(id);
    });

    actionButtonGroup.append(btnRemoveBook);

    bookCard.append(actionButtonGroup);

    return bookCard;
}

function markBookAsRead(bookId) {
    const books = getBooks();
    const bookIndex = findBookIndex(books, bookId);
    if (bookIndex == -1) return;
    books[bookIndex].isCompleted = true;
    
    updateBooks(books);
    reloadBooks();
}

function undoReadedBook(bookId) {
    const books = getBooks();
    const bookIndex = findBookIndex(books, bookId);
    if (bookIndex == -1) return;
    books[bookIndex].isCompleted = false;

    updateBooks(books);
    reloadBooks();
}

function getBooks() {
    if (typeof (Storage) !== 'undefined') {
        const books = localStorage.getItem(BOOKS_KEY);
        if ( books !== null) {
            return JSON.parse(books);
        }
    }
    return [];
}

function removeBook(bookId) {
    const confirmText = "Are you sure you want to delete this book ?";
    if (confirm(confirmText) != true) return;
    
    const books = getBooks();
    const bookIndex = findBookIndex(books, bookId);
    if (bookIndex == -1) return;
    
    books.splice(bookIndex, 1);
    updateBooks(books);
    reloadBooks();
}

function reloadBooks() {
    document.dispatchEvent(new Event(RENDER_BOOKS));
}

function updateBooks(books) {
    if (typeof (Storage) !== 'undefined') {
        localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    }
}

function findBook(books, bookId) {
    for (const book of books) {
        if (book.id === bookId) {
            return book;
        }
    }
    return null;
}

function findBookIndex(books, bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted,
    }
}

function addBook() {
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const year = document.getElementById('inputBookYear').value;
    const isCompleted = document.getElementById('inputBookAlreadyRead').checked;

    const bookId = generateId();
    const bookObj = generateBookObject(bookId, title, author, year, isCompleted);
    
    const books = getBooks();
    books.push(bookObj);

    updateBooks(books);
    reloadBooks();
}

function searchBooks(keyword) {
    const books = getBooks();
    const searchedBooks = [];
    for (const book of books) {
        const { title } = book;
        if (title.toLowerCase().includes(keyword)) {
            searchedBooks.push(book);
        }
    }

    return searchedBooks;
}

document.addEventListener('load', function() {
    if (typeof (Storage) !== 'undefined') {
        if (localStorage.getItem(BOOKS_KEY) === null) {
            localStorage.setItem(BOOKS_KEY, '{}');
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('formInputBook');
    submitForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addBook();
        clearForm();
    });

    const searchBookForm = document.getElementById('formSearchBook');
    searchBookForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const keyword = document.getElementById('searchBookKeyword').value;
        const searchedBooks = searchBooks(keyword);
        renderBooks(searchedBooks);
    });

    reloadBooks();
});

function clearForm() {
    document.getElementById('inputBookTitle').value = '';
    document.getElementById('inputBookAuthor').value = '';
    document.getElementById('inputBookYear').value = '';
    document.getElementById('inputBookAlreadyRead').checked = false;
}

function renderBooks(booksParam) {
    const unreadedBookList = document.getElementById('list-unreaded-book');
    unreadedBookList.innerHTML = '';
    const readedBookList = document.getElementById('list-readed-book');
    readedBookList.innerHTML = '';
    
    let books;
    if (booksParam) {
        books = booksParam;
    } else {
        books = getBooks();
    }

    for (const book of books) {
        const bookElement = makeBook(book);
        if (!book.isCompleted) {
            unreadedBookList.append(bookElement);
        } else {
            readedBookList.append(bookElement);
        }
    }
}

document.addEventListener(RENDER_BOOKS, function() {
    renderBooks();    
});