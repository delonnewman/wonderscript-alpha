; -*- mode: clojure -*-

(is (= (array 1 2 3) '(1 2 3)))
(is (array? '(1 2 3)))
(is (not (array? nil)))
