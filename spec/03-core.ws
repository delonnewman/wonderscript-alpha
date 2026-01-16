; -*- mode: clojure -*-

;; Arrays

(is (= (array 1 2 3) '(1 2 3)))
(is (array? '(1 2 3)))
(is (not (array? nil)))

;; Named

(is (nil? (namespace 'hey)))
(is (identical? "hey" (name 'hey)))
(is (identical? "hey" (namespace 'hey/you)))
(is (identical? "you" (name 'hey/you)))

;; Comment

(is (nil? (comment 1 2 3)))
(is (nil? (comment (say "Hi"))))

;; Cond

(is (nil? (cond false 1)))
(is (identical? 2 (cond nil 1 :else 2)))
(is (identical? 2 (cond false 1 :else 2)))
(is (identical? 1 (cond true 1 :else 2)))
(is (identical? 1 (cond true 1)))

;; Fn

(def greet
  (fn
    (() "Hello, World!")
    ((name) (str "Hello, " name "!"))))

(is (identical? "Hello, World!" (greet)))
(is (identical? "Hello, Jane!" (greet "Jane")))

;; JavaScript

(is (identical? "[object Date]" (js-object-tag (new js/Date))))

;; OOP

(def AClass (make-class))
(is (class? AClass))

(add-method AClass "hi" (fn* () "Hi!"))

(def a-instance (new AClass))
(is (instance? a-instance AClass))
(is (identical? "Hi!" (send a-instance :hi)))
